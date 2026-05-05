-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'user');

-- AlterTable
ALTER TABLE "users"
ADD COLUMN "banExpires" TIMESTAMP(3),
ADD COLUMN "banReason" TEXT,
ADD COLUMN "banned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "role" "Role" NOT NULL DEFAULT 'user';
