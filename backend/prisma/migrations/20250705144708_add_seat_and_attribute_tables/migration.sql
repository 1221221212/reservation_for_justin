/*
  Warnings:

  - The `status` column on the `seat_attribute` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `seat_attribute_group` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AttributeStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "SeatStatus" AS ENUM ('active', 'inactive', 'suspended');

-- AlterTable
ALTER TABLE "seat_attribute" DROP COLUMN "status",
ADD COLUMN     "status" "AttributeStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "seat_attribute_group" DROP COLUMN "status",
ADD COLUMN     "status" "AttributeStatus" NOT NULL DEFAULT 'active';

-- DropEnum
DROP TYPE "Status";

-- CreateTable
CREATE TABLE "seat" (
    "id" BIGSERIAL NOT NULL,
    "storeId" BIGINT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "minCapacity" INTEGER NOT NULL DEFAULT 1,
    "maxCapacity" INTEGER NOT NULL DEFAULT 1,
    "status" "SeatStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seat_attribute_assignment" (
    "seatId" BIGINT NOT NULL,
    "attributeId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seat_attribute_assignment_pkey" PRIMARY KEY ("seatId","attributeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "seat_storeId_name_key" ON "seat"("storeId", "name");

-- AddForeignKey
ALTER TABLE "seat" ADD CONSTRAINT "seat_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_attribute_assignment" ADD CONSTRAINT "seat_attribute_assignment_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "seat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_attribute_assignment" ADD CONSTRAINT "seat_attribute_assignment_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "seat_attribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
