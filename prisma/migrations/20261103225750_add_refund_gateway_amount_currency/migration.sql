-- AlterTable
ALTER TABLE "RefundTransaction" ADD COLUMN     "amount" DECIMAL(12,2),
ADD COLUMN     "currency" TEXT;
