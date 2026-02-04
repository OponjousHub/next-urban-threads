-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "emailVerifyToken" TEXT,
ADD COLUMN     "pendingEmail" TEXT;
