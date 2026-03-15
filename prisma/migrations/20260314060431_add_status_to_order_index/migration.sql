-- DropIndex
DROP INDEX "Order_tenantId_createdAt_idx";

-- CreateIndex
CREATE INDEX "Order_tenantId_createdAt_status_idx" ON "Order"("tenantId", "createdAt", "status");
