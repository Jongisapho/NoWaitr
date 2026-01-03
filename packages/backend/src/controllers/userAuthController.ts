import { Request, Response } from "express";
import { userBaseSchema, userRegisterSchema } from "../validators/user.schema";
import { userRegistrationInvite, validateToken, registerUser } from "../services/userAuthService";
import z from "zod";

export const inviteUser = async (req: Request, res: Response) => {

    const {businessId, branchId, registrationData} = req.body

    const parsed = userBaseSchema.safeParse(registrationData);
    if(!parsed.success){
        const details = z.treeifyError(parsed.error);
        return res.status(400).json({
            error: "Invalid request",
            details
        });
    }

    const userData = {
        businessId: businessId,
        branchId: branchId,
        userDetails: parsed.data
    }

    try{
        await userRegistrationInvite(userData);
        return res.status(201).json({ 
          message: "Invitation created"
        });

    }
    catch(err: any){ 

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

        if(typeof err?.message === "string" && err.message.includes("missing token")){
            return res.status(400).json({
            error: "Invalid token",
            details: err.message?? "Invalid or missing token",
          });
        }

        return res.status(500).json({
          error: "Internal server error",
          details: err?.message ?? "Unexpected error",
        });
        
    }
}

export const verifyToken = async (req: Request, res: Response) => {

    const {token} = req.body;

    if(!token || typeof token !== 'string' || token.trim() === ''){
         return res.status(400).json({
            error: "Invalid token",
            details: "Invalid or missing token (1.1)",
        });
    }

    try{
        const result = await validateToken(token);
        return res.status(200).json({
          message: "Token validated successfully",
          data: result,
        });

    }catch(err: any){

        if(typeof err?.message === "string" && err.message.includes("does not exist")){
            return res.status(404).json({
            error: "Invalid token",
            details: err.message?? "Token does not exist.",
          });
        }

        if(typeof err?.message === "string" && (err.message.includes("Token already used") || err.message.includes("Token Expired"))){
            return res.status(410).json({
            error: "Invalid token",
            details: err.message?? "Token already used or expired.",
          });
        }

        if(typeof err?.message === "string" && err.message.includes("User")){
            return res.status(404).json({
            error: "Not Found",
            details: err.message?? "User not found.",
          });
        }

        return res.status(500).json({
            error: "Internal server error",
            details: err?.message ?? "Unexpected error",
        });
    }
}

export const registerStaff = async (req: Request, res: Response) => {

    const {password, token} = req.body;
  
    const parsed = userRegisterSchema.safeParse({password});
    if(!parsed.success){
        const details = z.treeifyError(parsed.error);
        return res.status(400).json({
            error: "Invalid request",
            details
        });
    }

    if(!token || typeof token !== 'string' || token.trim() === ''){
        return res.status(400).json({
            error: "Invalid token",
            details: "Invalid or missing token (1.2)",
        });
    }

    try{

        const registrationInput = {
          password,
          token
        }
        const result = await registerUser(registrationInput);
        return res.status(201).json({
          message: "User registered successfully",
          data: result,
        });
    }
    catch(err: any){ 
      if(typeof err?.message === "string" && err.message.includes("does not exist")){
            return res.status(404).json({
            error: "Invalid token",
            details: err.message?? "Token does not exist.",
          });
        }

        if(typeof err?.message === "string" && (err.message.includes("Token already used") || err.message.includes("Token Expired"))){
            return res.status(410).json({
            error: "Invalid token",
            details: err.message?? "Token already used or expired.",
          });
        }

        return res.status(500).json({
            error: "Internal server error",
            details: err?.message ?? "Unexpected error",
        });
    }
}