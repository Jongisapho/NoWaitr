import { Request, Response } from "express";
import { registerBusinessService } from "../services/businessService";
import { registerBusinessSchema } from "../validators/registerBusiness.schema";
import z from "zod";

export const registerBusiness = async (req: Request, res: Response) => {
    
    // Zod validation
    const parsed = registerBusinessSchema.safeParse(req.body);
    if (!parsed.success) {
        const details = z.treeifyError(parsed.error);
        return res.status(400).json({
            error: "Invalid request",
            details // structured errors
        });
    }

    try {
        
        //Call service to register business
        const result = await registerBusinessService(parsed.data);
        return res.status(201).json({
          message: "Business registered successfully",
          data: result,
        });
    }
    catch (err: any) {
        // Prisma unique violation
        if (err?.code === "P2002") {
            return res.status(409).json({
                error: "Unique constraint violation",
                fields: err.meta?.target,
                details: err.message,
            });
        }
        
        // Pre-check custom error (admin email exists)
        if (err?.status === 409) {
          return res.status(409).json({
            error: "Unique constraint violation",
            fields: err.fields ?? [],
            details: err.message ?? "Conflict",
          });
        }

        // Slug generation exhausted
        if (typeof err?.message === "string" && err.message.includes("unique slug")) {
          return res.status(409).json({
            error: "Slug conflict",
            details: "Could not produce a unique slug",
          });
        }

        return res.status(500).json({
          error: "Internal server error",
          details: err?.message ?? "Unexpected error",
        });

    }

};

/*export const registerStaff = async (req: Request, res: Response) => {
    try{
        const { venueId, name , email , password } = req.body;

        if(!venueId || !name || !email || !password){
            return res.status(400).json({
                message: " All fields are required."
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
    }
    catch(err: any){

    }
}*/