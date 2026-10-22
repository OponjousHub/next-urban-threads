-- AlterTable
ALTER TABLE "PaymentFinalization" ADD COLUMN     "lockToken" TEXT,
ADD COLUMN     "lockedUntil" TIMESTAMP(3);
