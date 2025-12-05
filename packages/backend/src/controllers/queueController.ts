import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// must add error handling and validation 
// Incremental stage ....

export async function createQueue(req: Request, res: Response){
    const { name, venueId } = req.body;
    const q = await prisma.queue.create({ data: { name, venueId } });
    res.json(q);
}

export async function getQueue(req: Request, res: Response){
    const id = Number(req.params.id);
    const q = await prisma.queue.findUnique({ where: { id }, Include: {items: true } });
    res.json(q);
}

export async function serveNext(req: Request, res: Response){
    const queueId = Number(req.params.id);
    // finding the smallest waiting position
    const next = await prisma.queueItem.findFirst({ where: { queueId, status: "waiting" }, orderBy: { position: "asc" } });
    if (!next) return res.status(404).json({ message: "Queue empty"});
    const updated = await prisma.queueItem.update({ where: { id: next.id }, data: { status: "served" } });
    res.json(updated);
}

export async function listItems(req: Request, res: Response) {
    const queueId = Number(req.params.id);
    const items = await prisma.queueItem.findMany({ where: { queueId }, orderBy: { position: "asc" } });
    res.json(items);
}