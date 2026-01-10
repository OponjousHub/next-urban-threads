/*
  Warnings:

  - You are about to alter the column `totalAmount` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('PAYSTACK', 'FLUTTERWAVE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "currency" TEXT,
ADD COLUMN     "paymentProvider" "PaymentProvider",
ADD COLUMN     "paymentReference" TEXT,
ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(65,30);
