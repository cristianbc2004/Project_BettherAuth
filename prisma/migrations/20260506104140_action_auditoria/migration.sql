/*
  Warnings:

  - Changed the type of `action` on the `Auditoria` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('ADMIN_LIST', 'ADMIN_CREATE', 'ADMIN_DELETE', 'BIZUM_REQUEST_CREATE', 'BIZUM_TRANSFER_SEND', 'CARD_CREATE', 'AUTH_LOGIN', 'PASSWORD_RESET', 'PASSWORD_CHANGE', 'AUTH_REGISTER', 'TWO_FACTOR_ENABLE');

-- AlterTable
ALTER TABLE "Auditoria" DROP COLUMN "action",
ADD COLUMN     "action" "AuditAction" NOT NULL;
