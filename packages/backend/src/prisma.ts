
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({log: ["query","warn", "error"]});

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown for long-lived servers
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
