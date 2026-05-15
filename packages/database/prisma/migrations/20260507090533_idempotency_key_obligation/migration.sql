/*
  Warnings:

  - Made the column `idempotencyKey` on table `BizumTransfer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "BizumTransfer" ALTER COLUMN "idempotencyKey" SET NOT NULL;
