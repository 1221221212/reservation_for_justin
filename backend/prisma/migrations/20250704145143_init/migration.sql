-- CreateEnum
CREATE TYPE "Role" AS ENUM ('owner', 'manager', 'staff');

-- CreateEnum
CREATE TYPE "StoreStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "SelectionType" AS ENUM ('single', 'multiple');

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
    "status" "Status" NOT NULL DEFAULT 'active',
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
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seat_attribute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_account_user_id_key" ON "user_account"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "seat_attribute_group_storeId_name_key" ON "seat_attribute_group"("storeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "seat_attribute_storeId_groupId_name_key" ON "seat_attribute"("storeId", "groupId", "name");

-- AddForeignKey
ALTER TABLE "user_account" ADD CONSTRAINT "user_account_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_attribute_group" ADD CONSTRAINT "seat_attribute_group_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_attribute" ADD CONSTRAINT "seat_attribute_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_attribute" ADD CONSTRAINT "seat_attribute_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "seat_attribute_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
