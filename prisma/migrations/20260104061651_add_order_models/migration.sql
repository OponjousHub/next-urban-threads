/*
  Warnings:

  - You are about to drop the column `total` on the `Order` table. All the data in the column will be lost.
  - Added the required column `paymentMethod` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingAddress` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "total",
ADD COLUMN     "paymentMethod" TEXT NOT NULL,
ADD COLUMN     "shippingAddress" TEXT NOT NULL,
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL;
