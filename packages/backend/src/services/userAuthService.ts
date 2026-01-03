import { passwordHasher } from "./passwordEncryptionService";
import { UserRegisterDTO, UserBaseDTO, Role } from "../validators/user.schema";
import { prisma } from "../prisma";
import { normaliseEmail, generateToken, hashToken } from "../utils/strings";
import { sendRegistrationEmail } from "./emailService";
import { tokenValidationResult , userRegistrationResult} from "../interfaces/userRegisterTypes";

type userData = {
    businessId?: number | null,
    branchId: number,
    userDetails: UserBaseDTO
}

type userRegisterData = {
    email: string,
    password: string
}

type RegisterInput = {
  token: string;
  password: string;
};

export async function userRegistrationInvite(userData: userData) : Promise<void> {

    let {businessId,branchId, userDetails } = userData;

    if(userDetails.role !== Role.enum.ADMIN){
        businessId = null;
    }

    const normalisedEmail = normaliseEmail(userDetails.email);

    const existingUser = await prisma.user.findUnique({
        where: {email: normalisedEmail},
        select: { id: true, status: true },
    });

    //throw error if user with email already exists
    if(existingUser && existingUser.status !== 'INVITED'){
        const err = new Error("Email already in use.");
        (err as any).status = 409;
        (err as any).fields = ["email"];

        throw err;
    }
    
    let createdUserEmail: string | null = null;
    let inviteToken: string | null = null;

    await prisma.$transaction(async (tx) =>{

        const user = await tx.user.upsert({
            where: {email : normalisedEmail},
            update: {invitedAt: new Date()},
            create: {
                name: userDetails.name ?? null,
                email: normalisedEmail,
                password: null,
                role: userDetails.role,
                businessId: businessId?? null,
                branchId: branchId?? null,
                status: "INVITED",
                invitedAt: new Date(),
            },
            select: { id: true, email: true },
        });

        const token : string | null = generateToken();

        if (!token || typeof token !== "string" || token.trim().length === 0) {
          const err: any = new Error("Invalid or missing token (0.1).");
          err.status = 400;
          throw err;
        }

        const hashedToken = hashToken(token); //store hashed token
        const expiresAt: Date = new Date(Date.now() + 1000 * 60 * 60 * 48);
 
        await tx.invitationToken.upsert({
            where: { userId: user.id },
            update: { token: hashedToken, expiresAt, consumedAt: null, createdAt: new Date() },
            create: { userId: user.id, token: hashedToken, expiresAt },
        });

        createdUserEmail = user.email;
        inviteToken = token;
    })

    //generate registration link and send it to user email
    const baseUrl = process.env.FRONTEND_URL;
    if(!baseUrl){ 
        const err = new Error('FRONTEND_URL is not configured');
        (err as any).status = 500;
        throw err;
    }

    if(!inviteToken){
        const err = new Error('Invalid or missing token (0.2');
        (err as any).status = 400;
        throw err;
    }

    if(!createdUserEmail){
        const err = new Error('Invalid user email');
        (err as any).status = 500;
        throw err;
    }

    const link = `${baseUrl}/register?token=${encodeURIComponent(inviteToken)}`;
    await sendRegistrationEmail(createdUserEmail, link);
}

export async function validateToken(token: string): Promise<tokenValidationResult>{

    
    if (!token || !token.trim()) {
        const err: any = new Error("Invalid or missing token(0.3).");
        err.status = 400;
        throw err;
    }

    const hashedToken = hashToken(token);

    const tokenDetails = await prisma.invitationToken.findUnique({
        where: { token: hashedToken },
        select: {userId: true, expiresAt: true, consumedAt: true}
    });

    if(!tokenDetails){
        const err = new Error('Token does not exist.');
        (err as any).status = 404;
        throw err;
    }

    if (tokenDetails.consumedAt) {
        const err: any = new Error("Token already used.");
        err.status = 410;
        throw err;
    }

    const now = new Date();
    if(tokenDetails.expiresAt < now){
        const err = new Error('Token Expired.');
        (err as any).status = 410;
        throw err;
    }

    const user = await prisma.user.findUnique({
        where: {id: tokenDetails.userId},
        select: {name: true, email: true, role: true }
    })

    if(!user){
        const err = new Error('User not found');
        (err as any).status = 404; 
        throw err;
    }

    return user;
}

export async function registerUser(input: RegisterInput):Promise<userRegistrationResult>{

    const {token, password} = input;

    if (!token || !token.trim()) {
        const err: any = new Error("Invalid or missing token(0.4)");
        err.status = 400;
        throw err;
    }

    const hashedToken = hashToken(token);
    const hashedPw = await passwordHasher.hash(password);

    const returnUser = await prisma.$transaction(async (tx) =>{

        const tokenDetails = await tx.invitationToken.findUnique({
            where: { token: hashedToken },
            select: {userId: true, expiresAt: true, consumedAt: true}
        });

        if(!tokenDetails){
            const err = new Error('Token does not exist');
            (err as any).status = 404;
            throw err;
        }

        if (tokenDetails.consumedAt) {
            const err: any = new Error("Token already used");
            err.status = 410;
            throw err;
        }

        const now = new Date(Date.now());
        if(tokenDetails.expiresAt < now){
            const err = new Error('Token Expired.');
            (err as any).status = 410; //gone
            throw err;
        }

        const registeredUser = await tx.user.update({
            where: {id: tokenDetails.userId},
            data: {
                password: hashedPw,
                status: 'ACTIVE',
                emailVerifiedAt: now
            },
            select: { id: true,name: true,email: true,role: true }
        })

        await tx.invitationToken.update({
            where: {token: hashedToken},
            data: { consumedAt: now }

        })

        return {
            name: registeredUser.name,
            email: registeredUser.email,
            role: registeredUser.role
        };
    })
    
    return returnUser;
}