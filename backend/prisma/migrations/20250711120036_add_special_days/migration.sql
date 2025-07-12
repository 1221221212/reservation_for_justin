-- CreateEnum
CREATE TYPE "SpecialDayType" AS ENUM ('BUSINESS', 'CLOSED');

-- CreateTable
CREATE TABLE "special_day" (
    "id" BIGSERIAL NOT NULL,
    "storeId" BIGINT NOT NULL,
    "date" DATE NOT NULL,
    "type" "SpecialDayType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "special_day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "special_day_schedule" (
    "id" BIGSERIAL NOT NULL,
    "specialDayId" BIGINT NOT NULL,
    "layoutId" BIGINT NOT NULL,
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "special_day_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "special_day_storeId_date_key" ON "special_day"("storeId", "date");

-- CreateIndex
CREATE INDEX "special_day_schedule_specialDayId_idx" ON "special_day_schedule"("specialDayId");

-- AddForeignKey
ALTER TABLE "special_day" ADD CONSTRAINT "special_day_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "special_day_schedule" ADD CONSTRAINT "special_day_schedule_specialDayId_fkey" FOREIGN KEY ("specialDayId") REFERENCES "special_day"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "special_day_schedule" ADD CONSTRAINT "special_day_schedule_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "layout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
