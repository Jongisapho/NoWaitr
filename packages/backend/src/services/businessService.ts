import bcrypt from 'bcrypt';
import { prisma } from '../prisma';
import { BusinessStatus, DayOfWeek, Role } from '@prisma/client';
import { RegisterBusinessDTO, RegisterBranchDTO } from '../validators/registerBusiness.schema';
import { toSlug, normaliseEmail, buildSlugCandidates } from '../utils/strings';
import { RegisterBusinessResult, RegisterBranchResult } from '../interfaces/businessRegisterTypes';
import { Prisma } from '@prisma/client';
import { passwordHasher } from './passwordEncryptionService';


type OperatingHour = {
  day: DayOfWeek;
  openTime: string | null;
  closeTime: string | null;
};

type BranchRow = {
  id: number;
  name: string;
  code: string;
  slug: string;
  isDefault: boolean;
  isActive: boolean;
};

type branchData = { 
    businessId: number; 
    branchInput: RegisterBusinessDTO["branch"];
    initialSlug: string;
}

function defaultOperatingHours(): OperatingHour[] {
  return [
    { day: DayOfWeek.MON, openTime: "08:00", closeTime: "17:00" },
    { day: DayOfWeek.TUE, openTime: "08:00", closeTime: "17:00" },
    { day: DayOfWeek.WED, openTime: "08:00", closeTime: "17:00" },
    { day: DayOfWeek.THU, openTime: "08:00", closeTime: "17:00" },
    { day: DayOfWeek.FRI, openTime: "08:00", closeTime: "17:00" },
    { day: DayOfWeek.SAT, openTime: null, closeTime: null },
    { day: DayOfWeek.SUN, openTime: null, closeTime: null },
  ];
}


async function createBranchWithUniqueSlug(prsmaTransaction: Prisma.TransactionClient, data: branchData ): Promise<BranchRow>{
    const {businessId, branchInput, initialSlug} = data;

    //Create an array of potential slugs to use for branch
    const candidates = buildSlugCandidates(initialSlug, 50);

    let branchNormalisedEmail = null;

    if(branchInput.email?.trim() !== "" && branchInput.email){
      branchNormalisedEmail = normaliseEmail(branchInput.email);
    }

    for(const slug of candidates) {
        
        
      const rows = await prsmaTransaction.$queryRaw<BranchRow[]>`
      INSERT INTO "Branch" (
        "businessId","name","code","slug","description","contactPhone","email",
        "addressLine1","addressLine2","city","province","postalCode","country",
        "timezone","isDefault","isActive","createdAt","updatedAt"
      )
      VALUES (
        ${businessId}, ${branchInput.name}, ${branchInput.code}, ${slug},
        ${branchInput.description ?? null}, ${branchInput.contactPhone ?? null},
        ${branchNormalisedEmail},
        ${branchInput.addressLine1 ?? null}, ${branchInput.addressLine2 ?? null},
        ${branchInput.city ?? null}, ${branchInput.province ?? null},
        ${branchInput.postalCode ?? null}, ${branchInput.country ?? 'ZA'},
        ${branchInput.timezone ?? null}, ${branchInput.isDefault ?? false},
        ${true}, NOW(), NOW()
      )
      ON CONFLICT ("businessId","slug") DO NOTHING
      RETURNING "id","name","code","slug","isDefault","isActive";
    `;
    if (rows.length === 1) {
      // Successfully inserted a unique slug
      return rows[0];
    }

  }

  const err = new Error('Unable to generate a unique slug for branch');
    (err as any).status =  (err as any).status = 409;
    (err as any).fields = ['slug'];
    throw err;

}

export async function registerBusinessService(payload: RegisterBusinessDTO): Promise<RegisterBusinessResult>{

  let adminNormalisedEmail = undefined;

  if(payload.adminUser.email?.trim() !== "" && payload.adminUser.email){
    adminNormalisedEmail = normaliseEmail(payload.adminUser.email);
  }

  let businessNormalisedEmail = normaliseEmail(payload.business.contactEmail);

  const existingEmail = await prisma.user.findUnique({
    where: {email: adminNormalisedEmail}
  });

  if(existingEmail){
    const err = new Error("Admin email already in use.");
    (err as any).status = 409;
    (err as any).fields = ["User.email"];

    throw err;
  }

  const status: BusinessStatus = (payload.business.status as BusinessStatus)?? BusinessStatus.ACTIVE;
  const statusUpdatedAt = status !== BusinessStatus.ACTIVE? new Date(): null;

  const operatinghours = payload.branch.operatingHours?.map((h) => ({
    day: h.day as DayOfWeek,
    openTime: h.openTime?? null,
    closeTime: h.closeTime?? null
  }))?? defaultOperatingHours();

  const initialSlug = (payload.branch.slug && payload.branch.slug.trim()) || toSlug(`${payload.business.name} - ${payload.branch.name}`);
  //hash admin pw
  const hashedPw = await passwordHasher.hash(payload.adminUser.password);
  return prisma.$transaction(async (prsmaTransaction) => {
    
    // 1) Create Business
    const createdBusiness = await prsmaTransaction.business.create({
      data: {
        name: payload.business.name,
        legalName: payload.business.legalName ?? null,
        registrationNumber: payload.business.registrationNumber ?? null,
        contactEmail: businessNormalisedEmail,
        contactPhone: payload.business.contactPhone ?? null,
        website: payload.business.website ?? null,
        timezone: payload.business.timezone ?? "Africa/Johannesburg",
        preferredLanguage: payload.business.preferredLanguage ?? "en",
        status,
        statusUpdatedAt,
      },
    });

    
    // 2) BusinessSettings (optional)
    if (payload.business.settings) {
      await prsmaTransaction.businessSettings.create({
        data: {
          businessId: createdBusiness.id,
          defaults: payload.business.settings.defaults ?? undefined,
          notifications: payload.business.settings.notifications ?? undefined,
        },
      });
    }

    
    // 3) Branch (ensure unique slug)
    const branchRecord = await createBranchWithUniqueSlug(prsmaTransaction, {
      businessId: createdBusiness.id,
      branchInput: payload.branch,
      initialSlug,
    });

    
    // 4) Operating hours
    for (const oh of operatinghours) {
      await prsmaTransaction.branchOperatingHours.create({
        data: {
          branchId: branchRecord.id,
          day: oh.day,
          openTime: oh.openTime,
          closeTime: oh.closeTime,
        },
      });
    }

    // 5) BranchSettings (optional)
    if (payload.branch.settings) {
      await prsmaTransaction.branchSettings.create({
        data: {
          branchId: branchRecord.id,
          overrides: payload.branch.settings.overrides ?? undefined,
          notifications: payload.branch.settings.notifications ?? undefined,
        },
      });
    }

    
  // 6) Default Queue
    await prsmaTransaction.queue.create({
      data: {
        branchId: branchRecord.id,
        name: "Main Queue",
        isActive: true,
      },
    });

    // 7) Admin user
    
    const createdUser = await prsmaTransaction.user.create({
      data: {
        name: payload.adminUser.name ?? null,
        email: adminNormalisedEmail?? "",
        password: hashedPw,
        role: Role.ADMIN,
        businessId: createdBusiness.id,
        branchId: null
      },
    });

    
    return {
      business: {
        id: createdBusiness.id,
        name: createdBusiness.name,
        contactEmail: createdBusiness.contactEmail,
        status: createdBusiness.status,
      },
      branch: {
        id: branchRecord.id,
        slug: branchRecord.slug,
        code: branchRecord.code,
        isDefault: branchRecord.isDefault,
        isActive: branchRecord.isActive,
      },
      adminUser: {
        id: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
      },
    };

  })

}

export async function registerBranchService(businessID: number, payload: RegisterBranchDTO): Promise<RegisterBranchResult>{

  //Check if branch doesn't already exist in db
  const existingBranch = await prisma.branch.findUnique({
    where: {
      businessId_code: {
        businessId: businessID,
        code: payload.code,
      },
    }
  })

  //If branch exists throw error
  if(existingBranch){
    const err = new Error("Branch with this code already exists for this business.");
    (err as any).status = 409;
    (err as any).fields = ["code"];

    throw err;
  }

  // Ensure business exists and get its name
  const businessName = await prisma.business.findUnique({
    where: { id: businessID },
    select: { name: true },
  });

  if(!businessName){
    const err = new Error("Business does not exist.");
    (err as any).status = 404;
    (err as any).fields = ["id"];

    throw err;
  }
  
  //set intital slug
  const initialSlug = (payload.slug && payload.slug.trim()) || toSlug(`${businessName} - ${payload.name}`);

  //set operating hours
  const operatinghours = payload.operatingHours?.map((h) => ({
    day: h.day as DayOfWeek,
    openTime: h.openTime?? null,
    closeTime: h.closeTime?? null
  }))?? defaultOperatingHours();

  //Create Branch
  return prisma.$transaction(async (prsmaTransaction) => {
    const branchRecord = await createBranchWithUniqueSlug(prsmaTransaction, {
      businessId: businessID,
      branchInput: payload,
      initialSlug,
    });

    // Operating hours
    for (const oh of operatinghours) {
      await prsmaTransaction.branchOperatingHours.create({
        data: {
          branchId: branchRecord.id,
          day: oh.day,
          openTime: oh.openTime,
          closeTime: oh.closeTime,
        },
      });
    }

    //BranchSettings (optional)
    if (payload.settings) {
      await prsmaTransaction.branchSettings.create({
        data: {
          branchId: branchRecord.id,
          overrides: payload.settings.overrides ?? undefined,
          notifications: payload.settings.notifications ?? undefined,
        },
      });
    }

    // Default Queue
    await prsmaTransaction.queue.create({
      data: {
        branchId: branchRecord.id,
        name: "Main Queue",
        isActive: true,
      },
    });
    
    return{ 
      branch: {
        id: branchRecord.id,
        name: branchRecord.name,
        slug: branchRecord.slug,
        code: branchRecord.code,
        isDefault: branchRecord.isDefault,
        isActive: branchRecord.isActive,
      }
    }
  });
   
}


