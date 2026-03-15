-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'OWNER';

-- DropIndex
DROP INDEX "Order_tenantId_idx";

-- CreateIndex
CREATE INDEX "Order_tenantId_createdAt_idx" ON "Order"("tenantId", "createdAt");
