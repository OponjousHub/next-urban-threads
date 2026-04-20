/*
  Warnings:

  - You are about to drop the column `message` on the `OrderTrackingEvent` table. All the data in the column will be lost.
  - The `status` column on the `OrderTrackingEvent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `tenantId` to the `OrderTrackingEvent` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `OrderTrackingEvent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TrackingEventType" AS ENUM ('STATUS_CHANGE', 'COURIER_UPDATE', 'NOTE', 'SYSTEM');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'IN_TRANSIT';
ALTER TYPE "OrderStatus" ADD VALUE 'OUT_FOR_DELIVERY';
ALTER TYPE "OrderStatus" ADD VALUE 'RETURNED';
ALTER TYPE "OrderStatus" ADD VALUE 'FAILED';

-- AlterTable
ALTER TABLE "OrderTrackingEvent" DROP COLUMN "message",
ADD COLUMN     "tenantId" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "TrackingEventType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus";
