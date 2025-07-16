-- CreateTable
CREATE TABLE "reservation_settings" (
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

    CONSTRAINT "reservation_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reservation_settings_storeId_key" ON "reservation_settings"("storeId");

-- AddForeignKey
ALTER TABLE "reservation_settings" ADD CONSTRAINT "reservation_settings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
