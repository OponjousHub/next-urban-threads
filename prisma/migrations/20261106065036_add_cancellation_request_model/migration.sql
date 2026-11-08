/*
  Warnings:

  - A unique constraint covering the columns `[cancellationRequestId]` on the table `RefundRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AdminCancellationStatus" AS ENUM ('AWAITING_CUSTOMER', 'REFUND_IN_PROGRESS', 'COMPLETED', 'WITHDRAWN');

-- AlterTable
ALTER TABLE "RefundRequest" ADD COLUMN     "cancellationRequestId" TEXT;

-- CreateTable
CREATE TABLE "CancellationRequest" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "requestedByAdminId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "AdminCancellationStatus" NOT NULL DEFAULT 'AWAITING_CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CancellationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CancellationRequest_orderId_key" ON "CancellationRequest"("orderId");

-- CreateIndex
CREATE INDEX "CancellationRequest_tenantId_status_idx" ON "CancellationRequest"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "RefundRequest_cancellationRequestId_key" ON "RefundRequest"("cancellationRequestId");

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_cancellationRequestId_fkey" FOREIGN KEY ("cancellationRequestId") REFERENCES "CancellationRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancellationRequest" ADD CONSTRAINT "CancellationRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
