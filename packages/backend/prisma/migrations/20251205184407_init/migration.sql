-- CreateTable
CREATE TABLE "Venue" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Queue" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "venueId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueItem" (
    "id" SERIAL NOT NULL,
    "queueId" INTEGER NOT NULL,
    "userName" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QueueItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueItem" ADD CONSTRAINT "QueueItem_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "Queue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
