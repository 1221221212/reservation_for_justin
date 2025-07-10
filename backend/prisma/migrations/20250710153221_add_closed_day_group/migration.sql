-- CreateEnum
CREATE TYPE "ClosedDayType" AS ENUM ('WEEKLY', 'MONTHLY_DATE', 'MONTHLY_NTH_WEEK');

-- CreateTable
CREATE TABLE "closed_day_group" (
    "id" BIGSERIAL NOT NULL,
    "storeId" BIGINT NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "closed_day_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "closed_day" (
    "id" BIGSERIAL NOT NULL,
    "groupId" BIGINT NOT NULL,
    "type" "ClosedDayType" NOT NULL,
    "dayOfWeek" INTEGER,
    "dayOfMonth" INTEGER,
    "weekOfMonth" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "closed_day_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "closed_day_group_storeId_effective_from_key" ON "closed_day_group"("storeId", "effective_from");

-- AddForeignKey
ALTER TABLE "closed_day_group" ADD CONSTRAINT "closed_day_group_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "closed_day" ADD CONSTRAINT "closed_day_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "closed_day_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
