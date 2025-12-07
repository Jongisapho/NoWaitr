/*
  Warnings:

  - You are about to drop the column `visitCount` on the `Customer` table. All the data in the column will be lost.
  - The `status` column on the `QueueItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[venueId,name]` on the table `Queue` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[queueId,position]` on the table `QueueItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[qrCode]` on the table `Venue` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `position` to the `QueueItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `QueueItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('WAITING', 'SERVING', 'SERVED', 'CANCELED');

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "visitCount",
ALTER COLUMN "lastVisitAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Queue" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Main Queue';

-- AlterTable
ALTER TABLE "QueueItem" ADD COLUMN     "estimatedWaitMinutes" INTEGER,
ADD COLUMN     "partySize" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "position" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "QueueStatus" NOT NULL DEFAULT 'WAITING';

-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "qrCode" TEXT;

-- CreateTable
CREATE TABLE "EmailOTP" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailOTP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailOTP_email_idx" ON "EmailOTP"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Queue_venueId_name_key" ON "Queue"("venueId", "name");

-- CreateIndex
CREATE INDEX "QueueItem_queueId_customerId_idx" ON "QueueItem"("queueId", "customerId");

-- CreateIndex
CREATE INDEX "QueueItem_queueId_status_idx" ON "QueueItem"("queueId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "QueueItem_queueId_position_key" ON "QueueItem"("queueId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Venue_qrCode_key" ON "Venue"("qrCode");
