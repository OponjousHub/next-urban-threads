-- AlterTable
ALTER TABLE "User" DROP COLUMN "phone";

-- CreateTable
CREATE TABLE "PaymentFinalization" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "couponUsageProcessed" BOOLEAN NOT NULL DEFAULT false,
    "trackingEventCreated" BOOLEAN NOT NULL DEFAULT false,
    "vendorNotified" BOOLEAN NOT NULL DEFAULT false,
    "adminNotified" BOOLEAN NOT NULL DEFAULT false,
    "confirmationEmailSent" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentFinalization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentFinalization_orderId_key" ON "PaymentFinalization"("orderId");

-- CreateIndex
CREATE INDEX "PaymentFinalization_tenantId_status_idx" ON "PaymentFinalization"("tenantId", "status");

-- CreateIndex
CREATE INDEX "PaymentFinalization_status_updatedAt_idx" ON "PaymentFinalization"("status", "updatedAt");
