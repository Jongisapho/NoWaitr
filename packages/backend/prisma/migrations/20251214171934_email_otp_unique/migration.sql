/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `EmailOTP` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EmailOTP_email_key" ON "EmailOTP"("email");
