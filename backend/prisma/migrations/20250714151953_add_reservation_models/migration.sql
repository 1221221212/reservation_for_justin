/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `closed_day` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `closed_day_group` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `closed_day` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `closed_day_group` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('booked', 'cancelled', 'noshow');

-- AlterTable
ALTER TABLE "closed_day" DROP COLUMN "updatedAt",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "closed_day_group" DROP COLUMN "updatedAt",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "reservation" (
    "id" BIGSERIAL NOT NULL,
    "store_id" BIGINT NOT NULL,
    "course_id" BIGINT,
    "num_people" INTEGER NOT NULL DEFAULT 1,
    "status" "ReservationStatus" NOT NULL DEFAULT 'booked',
    "customer_name" TEXT NOT NULL,
    "customer_email" TEXT NOT NULL,
    "customer_phone" TEXT,
    "customer_memo" TEXT,
    "action_required" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_seat" (
    "reservation_id" BIGINT NOT NULL,
    "seat_id" BIGINT NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_seat_pkey" PRIMARY KEY ("reservation_id","seat_id","date","start_time")
);

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_seat" ADD CONSTRAINT "reservation_seat_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
