import { Request, Response } from "express";
import { registerBusinessService, registerBranchService } from "../services/businessService";
import { branchSchema, businessSchema, registerBusinessSchema } from "../validators/registerBusiness.schema";
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

export const registerBranch = async(req: Request, res: Response) =>{

const businessID = Number(req.params.id);
  if (!Number.isFinite(businessID) || businessID <= 0) {
    return res.status(400).json({
      error: "Invalid request",
      details: "Business id must be a positive number.",
    });
  }

  //validate branch data
  const parsed = branchSchema.safeParse(req.body.branchData);
  if (!parsed.success) {
    const details = z.treeifyError(parsed.error);

    return res.status(400).json({
      error: "Invalid request",
      details 
    });
  }

  try{

    //Call service to register branch
    const registeredBranch = await registerBranchService(businessID, parsed.data );

    return res.status(201).json({
      message: "Branch registered successfully",
      data: registeredBranch,
    });
  }
  catch(err: any){
    // Prisma unique violation
    if (err?.code === "P2002") {
        return res.status(409).json({
            error: "Unique constraint violation",
            fields: err.meta?.target,
            details: err.message?? "Conflict",
        });
    }

    // Pre-check custom error (business not found)
    if (err?.status === 404 && err.message.includes("Business")) {
      return res.status(404).json({
        error: "Business Not found",
        fields: err.fields ?? [],
        details: err.message ?? "Not Found",
      });
    }

    // Slug generation exhausted
    if (err?.status === 409 && typeof err?.message === "string" && err.message.includes("unique slug")) {
      return res.status(409).json({
        error: "Slug conflict",
        details: "Could not produce a unique slug",
      });
    }

    //branch code conflict
    if (err?.status === 409 && typeof err?.message === "string" && err.message.includes("code")) {
      return res.status(409).json({
        error: "Branch code conflict",
        details: "Branch with this code already exists for this business.",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      details: err?.message ?? "Unexpected error",
    });
  }

}
