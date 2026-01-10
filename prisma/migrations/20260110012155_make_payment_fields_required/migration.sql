/*
  Warnings:

  - Made the column `currency` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `paymentProvider` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `paymentReference` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "currency" SET NOT NULL,
ALTER COLUMN "paymentProvider" SET NOT NULL,
ALTER COLUMN "paymentReference" SET NOT NULL;
