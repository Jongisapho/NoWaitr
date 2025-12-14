import bcrypt from 'bcrypt';
import { prisma } from '../prisma';
import { RegisterCustomerDTO } from '../validators/registerCustomer.schema';
import { CustomerResult } from '../interfaces/customerRegisterTypes';
import { sendOTPEmail } from './emailService';
import { normaliseEmail } from '../utils/strings';

export async function registerCustomerService(
    payload: RegisterCustomerDTO
): Promise<CustomerResult> {
    const normalizedEmail = normaliseEmail(payload.email);

    let customer = await prisma.customer.findUnique({
        where: { email: normalizedEmail },
    });

    const isReturning = !!customer;
    if(!customer){
        customer = await prisma.customer.create({
            data: {
                name: payload.name.trim(),
                email: normalizedEmail,
                phone: payload.phone?.trim() || null,
            },
        });
    } else {
        customer = await prisma.customer.update({
            where: {id: customer.id},
            data: {
                name: payload.name.trim(),
                phone: payload.phone?.trim() || null,
            },
        });
    }

    // Generate and send OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    await prisma.emailOTP.upsert({
        where: {email: normalizedEmail},
        update: {
            code,
            expiresAt,
            verified: false,
            createdAt: new Date(),
        },
        create: {
            email: normalizedEmail,
            code,
            expiresAt,
        },
    });

    await sendOTPEmail(normalizedEmail, code);

    return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        createdAt: customer.createdAt,
        lastVisitAt: customer.lastVisitAt,
        isReturningCustomer: isReturning,
    };
}

export async function verifyOTPService(email: string, code: string): Promise<void>{
    const normalizedEmail = normaliseEmail(email);

    const otpRecord = await prisma.emailOTP.findFirst({
        where: {
            email: normalizedEmail,
            code, 
            verified: false,
            expiresAt: { gt: new Date()},
        },
        orderBy: { createdAt: 'desc'},
    });

    if(!otpRecord){
        const err = new Error('Invalid or expired OTP');
        (err as any ).status = 400;
        throw err;
    }

    await prisma.emailOTP.update({
        where : {id: otpRecord.id},
        data: {verified: true},
    });
}