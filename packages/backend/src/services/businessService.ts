import bcrypt from 'bcrypt';
import { prisma } from '../prisma';
import { BusinessStatus, DayOfWeek, Role } from '@prisma/client';
import { RegisterBusinessDTO } from '../validators/registerBusiness.schema';
import { toSlug, normaliseEmail } from '../utils/strings';
import { RegisterBusinessResult } from '../interfaces/businessRegisterTypes';
import { Prisma } from '@prisma/client';


type OperatingHour = {
  day: DayOfWeek;
  openTime: string | null;
  closeTime: string | null;
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


async function createBranchWithUniqueSlug(prsma: Prisma.TransactionClient, data: branchData ){
    const {businessId, branchInput, initialSlug} = data;

    //Create an array of potential slugs to use for branch
    const candidates = [initialSlug];
    for (let n = 2; n <= 50; n++) {
      candidates.push(`${initialSlug}-${n}`);
    }

    for(const slug of candidates) {
        
        try {
          const createdBranch = await prsma.branch.create({
            data: {
              businessId,
              name: branchInput.name,
              code: branchInput.code,
              slug,
              description: branchInput.description ?? null,
              contactPhone: branchInput.contactPhone ?? null,
              email: branchInput.email ?? null,
              addressLine1: branchInput.addressLine1 ?? null,
              addressLine2: branchInput.addressLine2 ?? null,
              city: branchInput.city ?? null,
              province: branchInput.province ?? null,
              postalCode: branchInput.postalCode ?? null,
              country: branchInput.country ?? "ZA",
              timezone: branchInput.timezone ?? null,
              isDefault: branchInput.isDefault ?? true,
              isActive: true,
            },
          });
          return createdBranch;
        } catch (err: any) {
          if (err?.code === "P2002") {
            const target = err?.meta?.target;

            if (Array.isArray(target) && target.includes("businessId_slug")) {
              continue; // try next slug candidate
            }
            if (Array.isArray(target) && target.includes("businessId_code")) {
              throw err; // code conflict won't be solved by slug change
            }
          }
          throw err;
        }
    }

    throw new Error("Unable to generate a unique slug for branch");
}

export async function registerBusinessService(payload: RegisterBusinessDTO): Promise<RegisterBusinessResult>{

  const email = normaliseEmail(payload.adminUser.email);

  const existingEmail = await prisma.user.findUnique({
    where: {email}
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

  return prisma.$transaction(async (prsma) => {
    
    // 1) Create Business
    const createdBusiness = await prsma.business.create({
      data: {
        name: payload.business.name,
        legalName: payload.business.legalName ?? null,
        registrationNumber: payload.business.registrationNumber ?? null,
        contactEmail: payload.business.contactEmail,
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
      await prsma.businessSettings.create({
        data: {
          businessId: createdBusiness.id,
          defaults: payload.business.settings.defaults ?? undefined,
          notifications: payload.business.settings.notifications ?? undefined,
        },
      });
    }

    
    // 3) Branch (ensure unique slug)
    const branchRecord = await createBranchWithUniqueSlug(prsma, {
      businessId: createdBusiness.id,
      branchInput: payload.branch,
      initialSlug,
    });

    
    // 4) Operating hours
    for (const oh of operatinghours) {
      await prsma.branchOperatingHours.create({
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
      await prsma.branchSettings.create({
        data: {
          branchId: branchRecord.id,
          overrides: payload.branch.settings.overrides ?? undefined,
          notifications: payload.branch.settings.notifications ?? undefined,
        },
      });
    }

    
  // 6) Default Queue
    await prsma.queue.create({
      data: {
        branchId: branchRecord.id,
        name: "Main Queue",
        isActive: true,
      },
    });

    // 7) Admin user
    const hashedPw = await bcrypt.hash(payload.adminUser.password, 12);
    const createdUser = await prsma.user.create({
      data: {
        name: payload.adminUser.name ?? null,
        email: payload.adminUser.email,
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



