import { Request, Response } from "express";
import { prisma } from "../prisma";
import bcrypt from "bcrypt";


export const registerVenue = async (req: Request, res: Response) => {
    try {
        const { name, description, adminName, adminEmail, adminPassword } = req.body;
        if(!name || !adminEmail || !adminPassword || !adminName){
            return res.status(400).json({
                message: "Venue name and admin credentials are required"
            });
        }

        const normalizedEmail = adminEmail.toLowerCase().trim();

        const exitingUser = await prisma.user.findUnique({
            where: {email: normalizedEmail}
        });

        if(exitingUser){
            return res.status(409).json({
                message:"An Admin with this email already exists. Please use a different email or log in."
            });
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const venue = await prisma.venue.create({
            data:{
                name, 
                description,
                users:{
                    create:{
                        name: adminName,
                        email: adminEmail,
                        password: hashedPassword,
                        role: "ADMIN"
                    }
                }
            },
            include: {
                users: true
            }
        });
        return res.status(201).json({
            message: " Venue and admin registered successfully.", 
            venue
        })

    } catch (err: any){
        console.error("Venue registration error:", err);
        res.status(500).json({
            message:"Internal server error"
        });
    }
};

export const registerStaff = async (req: Request, res: Response) => {
    try{
        const { venueId, name , email , password } = req.body;

        if(!venueId || !name || !email || !password){
            return res.status(400).json({
                message: " All fields are required."
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
    }
}