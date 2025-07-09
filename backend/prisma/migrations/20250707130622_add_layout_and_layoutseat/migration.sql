-- CreateEnum
CREATE TYPE "LayoutStatus" AS ENUM ('active', 'inactive');

-- CreateTable
CREATE TABLE "layout" (
    "id" BIGSERIAL NOT NULL,
    "storeId" BIGINT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status" "LayoutStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "layout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "layout_seat" (
    "layoutId" BIGINT NOT NULL,
    "seatId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "layout_seat_pkey" PRIMARY KEY ("layoutId","seatId")
);

-- CreateIndex
CREATE UNIQUE INDEX "layout_storeId_name_key" ON "layout"("storeId", "name");

-- AddForeignKey
ALTER TABLE "layout" ADD CONSTRAINT "layout_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layout_seat" ADD CONSTRAINT "layout_seat_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "layout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layout_seat" ADD CONSTRAINT "layout_seat_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "seat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
