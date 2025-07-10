-- CreateTable
CREATE TABLE "layout_schedule_group" (
    "id" BIGSERIAL NOT NULL,
    "storeId" BIGINT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status" "LayoutStatus" NOT NULL DEFAULT 'active',
    "effective_from" TIMESTAMP(3) NOT NULL,
    "applyOnHoliday" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "layout_schedule_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "layout_schedule" (
    "id" BIGSERIAL NOT NULL,
    "groupId" BIGINT NOT NULL,
    "layoutId" BIGINT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME,
    "status" "LayoutStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "layout_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "layout_schedule_group_storeId_name_key" ON "layout_schedule_group"("storeId", "name");

-- CreateIndex
CREATE INDEX "layout_schedule_groupId_dayOfWeek_idx" ON "layout_schedule"("groupId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "layout_schedule_group" ADD CONSTRAINT "layout_schedule_group_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layout_schedule" ADD CONSTRAINT "layout_schedule_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "layout_schedule_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layout_schedule" ADD CONSTRAINT "layout_schedule_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "layout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
