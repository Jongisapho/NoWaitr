import { Request, Response } from "express";
import { prisma } from "../prisma";
import { sendOTPEmail } from "../services/emailService";

export const registerCustomer = async (req: Request, res: Response) => {
    try {
        const { name, email, phone } = req.body;

        if (!email || !name) {
            return res.status(400).json({
                message: "Name & email are required."
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingCustomer = await prisma.customer.findUnique({
            where: { email: normalizedEmail }
        });

        let customer;

        if(!existingCustomer){
            customer = await prisma.customer.create({
                data: {
                    name, 
                    email: normalizedEmail,
                    phone
                }
            })
        } else {
            customer = await prisma.customer.update({
                where: {
                    id: existingCustomer.id
                },
                data: {
                    name, 
                    phone
                }
            });
        }

        // Generate OTP automatically after registration
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        await prisma.emailOTP.create({
            data : {
                email: normalizedEmail,
                code,
                expiresAt
            }
        });

        await sendOTPEmail(normalizedEmail, code);

        return res.status(existingCustomer ? 200 : 201).json({
            message: "Registration successful. The OTP has been sent to your email.",
            customer,
            isReturningCustomer: !!existingCustomer
        });

    } catch (err: any) {
        console.error("Customer registration error:", err);
        if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
            return res.status(409).json({ message: "Email already registered" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const verifyOTP = async(req: Request, res: Response) => {
    try {
        const { email, code } = req.body;

        const normalizedEmail = email.toLowerCase().trim();

        const otpRecord = await prisma.emailOTP.findFirst({
            where: {
                email: normalizedEmail,
                code,
                verified: false,
                expiresAt: {gt: new Date()}
            },
            orderBy: {createdAt: "desc"}
        });

        if(!otpRecord){
            return res.status(400).json({ message: "Invalid or expired OTP"});
        }

        await prisma.emailOTP.update({
            where: {id: otpRecord.id},
            data: {verified: true}
        });

        return res.json({ message: "OTP verfied successfully"});

    } catch(err){
        console.error(err);
        res.status(500).json({ message: "OTP verification failed"});
    }
};
