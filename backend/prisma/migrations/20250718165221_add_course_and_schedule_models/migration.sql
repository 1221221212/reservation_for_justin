-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('active', 'inactive', 'suspended');

-- CreateEnum
CREATE TYPE "SpecialScheduleType" AS ENUM ('opening', 'closure');

-- CreateTable
CREATE TABLE "course" (
    "id" BIGSERIAL NOT NULL,
    "store_id" BIGINT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "price" DECIMAL(10,2),
    "min_people" INTEGER,
    "max_people" INTEGER,
    "duration_minutes" INTEGER NOT NULL,
    "description" TEXT,
    "status" "CourseStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_image" (
    "id" BIGSERIAL NOT NULL,
    "course_id" BIGINT NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_schedule_group" (
    "id" BIGSERIAL NOT NULL,
    "course_id" BIGINT NOT NULL,
    "status" "CourseStatus" NOT NULL DEFAULT 'active',
    "effective_from" TIMESTAMP(3),
    "effective_to" TIMESTAMP(3),
    "apply_on_holiday" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_schedule_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_schedule" (
    "id" BIGSERIAL NOT NULL,
    "group_id" BIGINT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "status" "CourseStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "special_course_schedule_group" (
    "id" BIGSERIAL NOT NULL,
    "course_id" BIGINT NOT NULL,
    "date" DATE NOT NULL,
    "type" "SpecialScheduleType" NOT NULL,
    "reason" VARCHAR(255),
    "status" "CourseStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "special_course_schedule_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "special_course_schedule" (
    "id" BIGSERIAL NOT NULL,
    "group_id" BIGINT NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "status" "CourseStatus" NOT NULL DEFAULT 'active',
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "special_course_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "course_store_id_idx" ON "course"("store_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_store_id_name_key" ON "course"("store_id", "name");

-- CreateIndex
CREATE INDEX "course_image_course_id_idx" ON "course_image"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_schedule_group_course_id_key" ON "course_schedule_group"("course_id");

-- CreateIndex
CREATE INDEX "course_schedule_group_id_day_of_week_idx" ON "course_schedule"("group_id", "day_of_week");

-- CreateIndex
CREATE UNIQUE INDEX "special_course_schedule_group_course_id_date_key" ON "special_course_schedule_group"("course_id", "date");

-- CreateIndex
CREATE INDEX "special_course_schedule_group_id_idx" ON "special_course_schedule"("group_id");

-- AddForeignKey
ALTER TABLE "course_image" ADD CONSTRAINT "course_image_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_schedule_group" ADD CONSTRAINT "course_schedule_group_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_schedule" ADD CONSTRAINT "course_schedule_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "course_schedule_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "special_course_schedule_group" ADD CONSTRAINT "special_course_schedule_group_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "special_course_schedule" ADD CONSTRAINT "special_course_schedule_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "special_course_schedule_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
