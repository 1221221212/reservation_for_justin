/*
  Warnings:

  - A unique constraint covering the columns `[reservation_code]` on the table `reservation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "reservation" ADD COLUMN     "reservation_code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "reservation_reservation_code_key" ON "reservation"("reservation_code");
