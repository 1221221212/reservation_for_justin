/*
  Warnings:

  - A unique constraint covering the columns `[storeId,effective_from]` on the table `layout_schedule_group` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "layout_schedule_group_storeId_effective_from_key" ON "layout_schedule_group"("storeId", "effective_from");
