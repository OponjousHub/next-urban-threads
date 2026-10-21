/*
  Warnings:

  - A unique constraint covering the columns `[adminId,dedupeKey]` on the table `AdminNotification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dedupeKey]` on the table `OrderTrackingEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[vendorId,dedupeKey]` on the table `VendorNotification` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AdminNotification" ADD COLUMN     "dedupeKey" TEXT;

-- AlterTable
ALTER TABLE "OrderTrackingEvent" ADD COLUMN     "dedupeKey" TEXT;

-- AlterTable
ALTER TABLE "VendorNotification" ADD COLUMN     "dedupeKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AdminNotification_adminId_dedupeKey_key" ON "AdminNotification"("adminId", "dedupeKey");

-- CreateIndex
CREATE UNIQUE INDEX "OrderTrackingEvent_dedupeKey_key" ON "OrderTrackingEvent"("dedupeKey");

-- CreateIndex
CREATE UNIQUE INDEX "VendorNotification_vendorId_dedupeKey_key" ON "VendorNotification"("vendorId", "dedupeKey");
