import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();



/**
 * export const checkInToQueue = async (req: Request, res: Response) => {
    try {
        const { customerId, venueId, partySize = 1 } = req.body;

        if (!customerId || !venueId) {
            return res.status(400).json({
                message: "Customer ID and Venue ID are required"
            });
        }

        // 1. Verify customer exists
        const customer = await prisma.customer.findUnique({
            where: { id: customerId }
        });

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found. Please register first."
            });
        }

        // 2. Verify venue exists
        const venue = await prisma.venue.findUnique({
            where: { id: venueId }
        });

        if (!venue) {
            return res.status(404).json({
                message: "Venue not found"
            });
        }

        // 3. Get or create active queue for venue
        let queue = await prisma.queue.findFirst({
            where: { 
                venueId, 
                isActive: true 
            }
        });

        if (!queue) {
            queue = await prisma.queue.create({
                data: {
                    venueId,
                    name: "Main Queue"
                }
            });
        }

        // 4. Check if already in queue
        const existingQueueItem = await prisma.queueItem.findFirst({
            where: {
                queueId: queue.id,
                customerId,
                status: { in: ["waiting", "serving"] }
            }
        });

        if (existingQueueItem) {
            return res.status(400).json({
                message: "You are already in the queue",
                position: existingQueueItem.position
            });
        }

        // 5. Calculate position in queue
        const lastPosition = await prisma.queueItem.findFirst({
            where: { queueId: queue.id },
            orderBy: { position: 'desc' },
            select: { position: true }
        });

        const position = (lastPosition?.position || 0) + 1;

        // 6. Add to queue
        const queueItem = await prisma.queueItem.create({
            data: {
                queueId: queue.id,
                customerId,
                partySize,
                position,
                status: "waiting"
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        // 7. Update customer's lastVisitAt
        await prisma.customer.update({
            where: { id: customerId },
            data: { lastVisitAt: new Date() }
        });

        // 8. Update or create visit record
        await prisma.customerVisit.upsert({
            where: {
                customerId_venueId: {
                    customerId,
                    venueId
                }
            },
            update: {
                visitCount: { increment: 1 },
                lastVisitAt: new Date()
            },
            create: {
                customerId,
                venueId,
                visitCount: 1,
                lastVisitAt: new Date()
            }
        });

        return res.json({
            message: "Successfully checked into queue",
            position,
            estimatedWait: calculateWaitTime(position), // Your calculation function
            queueItem
        });

    } catch (err) {
        console.error("Check-in error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Helper function for wait time calculation
function calculateWaitTime(position: number): number {
    // Example: 5 minutes per person ahead
    return (position - 1) * 5;
}
 */