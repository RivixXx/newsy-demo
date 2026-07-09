-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('INDIVIDUAL', 'IP', 'OOO', 'AO', 'SELF_EMPLOYED');

-- AlterTable: add business fields to User
ALTER TABLE "User" ADD COLUMN "accountType" "AccountType" NOT NULL DEFAULT 'INDIVIDUAL';
ALTER TABLE "User" ADD COLUMN "companyName" TEXT;
ALTER TABLE "User" ADD COLUMN "inn" TEXT;
ALTER TABLE "User" ADD COLUMN "companySize" TEXT;
ALTER TABLE "User" ADD COLUMN "employeeCount" INTEGER;
ALTER TABLE "User" ADD COLUMN "companyAddress" TEXT;
ALTER TABLE "User" ADD COLUMN "platformName" TEXT;
