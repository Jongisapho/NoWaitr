import { Request, Response } from "express";
import { registerCustomerSchema, verifyOTPSchema } from "../validators/registerCustomer.schema";
import { registerCustomerService, verifyOTPService } from "../services/customerService";
import z from "zod";
import { sendWelcomeEmail } from "../services/emailService";
import { prisma } from "../prisma";

export const registerCustomer = async (req: Request, res: Response) => {
  const parsed = registerCustomerSchema.safeParse(req.body);
  if (!parsed.success) {
    const details = z.treeifyError(parsed.error);
    return res.status(400).json({ error: "Invalid request", details });
  }

  try {
    const result = await registerCustomerService(parsed.data);
    return res.status(result.isReturningCustomer ? 200 : 201).json({
      message: "OTP sent to email for verification",
      customer: result,
      isReturningCustomer: result.isReturningCustomer,
    });
  } catch (err: any) {
    if (err?.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error("Customer registration error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  const parsed = verifyOTPSchema.safeParse(req.body);
  if (!parsed.success) {
    const details = z.treeifyError(parsed.error);
    return res.status(400).json({ error: "Invalid request", details });
  }

  try {
    await verifyOTPService(parsed.data.email, parsed.data.code);

    const normalizedEmail = parsed.data.email;
    const customer = await prisma.customer.findUnique({
      where: { email: normalizedEmail },
      select: { name: true },
    });

    await sendWelcomeEmail(normalizedEmail, customer?.name || "there");

    return res.json({ message: "Email verified successfully! Welcome email sent. " });
  } catch (err: any) {
    if (err?.status === 400) {
      return res.status(400).json({ error: err.message });
    }
    console.error("OTP verification error:", err);
    return res.status(500).json({ error: "Verification failed" });
  }
};