import { z } from 'zod';

const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format (optional strictness)

export const registerCustomerSchema = z.object({
    name: z.string().min(3, "Name must be atleast 3 characters"),
    email: z.string().email("Invalid email address"),
    phone: z
    .string()
    .regex(phoneRegex, "Invalid phone number format")
    .optional()
    .or(z.literal("")), //allow empty string as null
});

export const verifyOTPSchema = z.object({
    email: z.string().email("Invalid email adress"),
    code: z.string().length(6, "OTP must be 6 digits"),
});

export type RegisterCustomerDTO = z.infer<typeof registerCustomerSchema>;
export type verifyOTPDTO = z.infer<typeof verifyOTPSchema>;