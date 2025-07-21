-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'MANAGER', 'STAFF');

-- CreateEnum
CREATE TYPE "StoreStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AttributeStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SelectionType" AS ENUM ('SINGLE', 'MULTIPLE');

-- CreateEnum
CREATE TYPE "SeatStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "LayoutStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ClosedDayType" AS ENUM ('WEEKLY', 'MONTHLY_DATE', 'MONTHLY_NTH_WEEK');

-- CreateEnum
CREATE TYPE "SpecialDayType" AS ENUM ('BUSINESS', 'CLOSED');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('BOOKED', 'CANCELLED', 'NOSHOW');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "SpecialScheduleType" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "store" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status" "StoreStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_account" (
    "id" BIGSERIAL NOT NULL,
    "store_id" BIGINT,
    "role" "Role" NOT NULL,
    "user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seat_attribute_group" (
    "id" BIGSERIAL NOT NULL,
    "storeId" BIGINT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "selectionType" "SelectionType" NOT NULL,
    "status" "AttributeStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seat_attribute_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seat_attribute" (
    "id" BIGSERIAL NOT NULL,
    "storeId" BIGINT NOT NULL,
    "groupId" BIGINT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status" "AttributeStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seat_attribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seat_attribute_assignment" (
    "seatId" BIGINT NOT NULL,
    "attributeId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seat_attribute_assignment_pkey" PRIMARY KEY ("seatId","attributeId")
);

-- CreateTable
CREATE TABLE "seat" (
    "id" BIGSERIAL NOT NULL,
    "storeId" BIGINT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "minCapacity" INTEGER NOT NULL DEFAULT 1,
    "maxCapacity" INTEGER NOT NULL DEFAULT 1,
    "status" "SeatStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "layout" (
    "id" BIGSERIAL NOT NULL,
    "storeId" BIGINT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status" "LayoutStatus" NOT NULL DEFAULT 'ACTIVE',
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

-- CreateTable
CREATE TABLE "layout_schedule_group" (
    "id" BIGSERIAL NOT NULL,
    "storeId" BIGINT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status" "LayoutStatus" NOT NULL DEFAULT 'ACTIVE',
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
    "status" "LayoutStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "layout_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "closed_day_group" (
    "id" BIGSERIAL NOT NULL,
    "storeId" BIGINT NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

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
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "closed_day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "special_day" (
    "id" BIGSERIAL NOT NULL,
    "storeId" BIGINT NOT NULL,
    "date" DATE NOT NULL,
    "type" "SpecialDayType" NOT NULL,
    "reason" VARCHAR(255),
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

-- CreateTable
CREATE TABLE "holiday" (
    "date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "holiday_pkey" PRIMARY KEY ("date")
);

-- CreateTable
CREATE TABLE "reservation" (
    "id" BIGSERIAL NOT NULL,
    "reservation_code" TEXT,
    "store_id" BIGINT NOT NULL,
    "course_id" BIGINT,
    "num_people" INTEGER NOT NULL DEFAULT 1,
    "status" "ReservationStatus" NOT NULL DEFAULT 'BOOKED',
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
    "status" "CourseStatus" NOT NULL DEFAULT 'ACTIVE',
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
    "status" "CourseStatus" NOT NULL DEFAULT 'ACTIVE',
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
    "status" "CourseStatus" NOT NULL DEFAULT 'ACTIVE',
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
    "status" "CourseStatus" NOT NULL DEFAULT 'ACTIVE',
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
    "status" "CourseStatus" NOT NULL DEFAULT 'ACTIVE',
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "special_course_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_setting" (
    "id" BIGSERIAL NOT NULL,
    "storeId" BIGINT NOT NULL,
    "gridUnit" INTEGER NOT NULL DEFAULT 15,
    "standardReservationMinutes" INTEGER NOT NULL DEFAULT 60,
    "bookingWindow" JSONB NOT NULL DEFAULT '{}',
    "bufferTime" INTEGER NOT NULL DEFAULT 0,
    "allowCourseSelection" BOOLEAN NOT NULL DEFAULT false,
    "allowSeatSelection" BOOLEAN NOT NULL DEFAULT false,
    "allowSeatCombination" BOOLEAN NOT NULL DEFAULT false,
    "minCombinationPartySize" INTEGER,
    "maxCombinationSeats" INTEGER,
    "cancellationPolicy" JSONB DEFAULT '{}',
    "modificationPolicy" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_account_user_id_key" ON "user_account"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "seat_attribute_group_storeId_name_key" ON "seat_attribute_group"("storeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "seat_attribute_storeId_groupId_name_key" ON "seat_attribute"("storeId", "groupId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "seat_storeId_name_key" ON "seat"("storeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "layout_storeId_name_key" ON "layout"("storeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "layout_schedule_group_storeId_name_key" ON "layout_schedule_group"("storeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "layout_schedule_group_storeId_effective_from_key" ON "layout_schedule_group"("storeId", "effective_from");

-- CreateIndex
CREATE INDEX "layout_schedule_groupId_dayOfWeek_idx" ON "layout_schedule"("groupId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "layout_schedule_groupId_dayOfWeek_start_time_idx" ON "layout_schedule"("groupId", "dayOfWeek", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "closed_day_group_storeId_effective_from_key" ON "closed_day_group"("storeId", "effective_from");

-- CreateIndex
CREATE UNIQUE INDEX "special_day_storeId_date_key" ON "special_day"("storeId", "date");

-- CreateIndex
CREATE INDEX "special_day_schedule_specialDayId_idx" ON "special_day_schedule"("specialDayId");

-- CreateIndex
CREATE UNIQUE INDEX "reservation_reservation_code_key" ON "reservation"("reservation_code");

-- CreateIndex
CREATE INDEX "reservation_seat_date_start_time_idx" ON "reservation_seat"("date", "start_time");

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

-- CreateIndex
CREATE UNIQUE INDEX "reservation_setting_storeId_key" ON "reservation_setting"("storeId");

-- AddForeignKey
ALTER TABLE "user_account" ADD CONSTRAINT "user_account_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_attribute_group" ADD CONSTRAINT "seat_attribute_group_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_attribute" ADD CONSTRAINT "seat_attribute_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_attribute" ADD CONSTRAINT "seat_attribute_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "seat_attribute_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_attribute_assignment" ADD CONSTRAINT "seat_attribute_assignment_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "seat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_attribute_assignment" ADD CONSTRAINT "seat_attribute_assignment_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "seat_attribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat" ADD CONSTRAINT "seat_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layout" ADD CONSTRAINT "layout_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layout_seat" ADD CONSTRAINT "layout_seat_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "layout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layout_seat" ADD CONSTRAINT "layout_seat_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "seat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layout_schedule_group" ADD CONSTRAINT "layout_schedule_group_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layout_schedule" ADD CONSTRAINT "layout_schedule_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "layout_schedule_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layout_schedule" ADD CONSTRAINT "layout_schedule_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "layout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "closed_day_group" ADD CONSTRAINT "closed_day_group_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "closed_day" ADD CONSTRAINT "closed_day_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "closed_day_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "special_day" ADD CONSTRAINT "special_day_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "special_day_schedule" ADD CONSTRAINT "special_day_schedule_specialDayId_fkey" FOREIGN KEY ("specialDayId") REFERENCES "special_day"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "special_day_schedule" ADD CONSTRAINT "special_day_schedule_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "layout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_seat" ADD CONSTRAINT "reservation_seat_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "reservation_setting" ADD CONSTRAINT "reservation_setting_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
