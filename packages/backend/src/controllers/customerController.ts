import { Request, Response } from "express";
import { prisma } from "../prisma";

/**
 * Mini Registration / Returning Customer
 * - If customer exists -> update visit count
 * - else -> create new customer
 */

export const registerOrFindCustomer = async (req: Request, res: Response) => {
    try {
        const { name, email, phone} = req.body;
        if(!email){
            return res.status(400).json({ message: "Email is required !"});
        }

        const existingCustomer = await prisma.customer.findUnique({
            where: {email}
        });

        if(existingCustomer) {
            const updatedCustomer = await prisma.customer.update({
                where: { email },
                data : {
                    visitCount : { increment: 1}
                }
            });

            return res.json({
                message: "Welcome back !",
                customer: updatedCustomer
            });
        }

        if(!name){
            return res.status(400).json({ message: "Name is required for first visit"});
        }

        const newCustomer = await prisma.customer.create({
            data : {
                name,
                email,
                phone
            }
        });

        return res.status(201).json({
            message: "Customer registered successfully",
            customer: newCustomer
        });

    } catch (error){
        console.error("Customer registration error:", error);
        res.status(500).json({ message: "Internal server error"})
    }
};

