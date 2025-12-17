import bcrypt from 'bcrypt';
import { prisma } from '../prisma';
import { RegisterCustomerDTO } from '../validators/registerCustomer.schema';
import { CustomerResult } from '../interfaces/customerRegisterTypes';
import { CustomerLoginResponse } from '../interfaces/customerRegisterTypes';
import { sendOTPEmail } from './emailService';
import { normaliseEmail } from '../utils/strings';
import { generateOTPCode } from '../utils/strings';
import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export async function registerCustomerService(
    payload: RegisterCustomerDTO
): Promise<CustomerResult> {
    const normalizedEmail = normaliseEmail(payload.email);

    let customer = await prisma.customer.findUnique({
        where: { email: normalizedEmail },
    });

    const isReturning = !!customer;
    if (!customer) {
        customer = await prisma.customer.create({
            data: {
                name: payload.name.trim(),
                email: normalizedEmail,
                phone: payload.phone?.trim() || null,
            },
        });
    } else {
        customer = await prisma.customer.update({
            where: { id: customer.id },
            data: {
                name: payload.name.trim(),
                phone: payload.phone?.trim() || null,
            },
        });
    }

    // Generate and send OTP
    const code = generateOTPCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    await prisma.emailOTP.upsert({
        where: { email: normalizedEmail },
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

export async function verifyOTPService(email: string, code: string): Promise<CustomerLoginResponse['customer']> {
    const normalizedEmail = normaliseEmail(email);

    const otpRecord = await prisma.emailOTP.findFirst({
        where: {
            email: normalizedEmail,
            code,
            verified: false,
            expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
        const err = new Error('Invalid or expired OTP');
        (err as any).status = 400;
        throw err;
    }

    await prisma.emailOTP.update({
        where: { id: otpRecord.id },
        data: { verified: true },
    });

    const customer = await prisma.customer.findUnique({
        where: { email: normalizedEmail },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
        },
    });

    if(!customer){
        const err = new Error('Customer not found');
        (err as any).status = 500;
        throw err;
    }
    return customer ;
}