/*
  Warnings:

  - Added the required column `updatedAt` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('UNREAD', 'READ', 'RESOLVED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'NORMAL', 'HIGH');

-- CreateEnum
CREATE TYPE "ContactTag" AS ENUM ('BUG', 'ORDER', 'REFUND', 'GENERAL');

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "status" "ContactStatus" NOT NULL DEFAULT 'UNREAD',
ADD COLUMN     "tag" "ContactTag",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
