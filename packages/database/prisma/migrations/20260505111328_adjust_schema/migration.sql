/*
  Warnings:

  - A unique constraint covering the columns `[transferId]` on the table `BizumRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "targets" ADD COLUMN     "balanceCents" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "totalBalanceCents" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "BizumRequest_requesterUserId_idx" ON "BizumRequest"("requesterUserId");

-- CreateIndex
CREATE INDEX "BizumRequest_payerUserId_idx" ON "BizumRequest"("payerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "BizumRequest_transferId_key" ON "BizumRequest"("transferId");

-- CreateIndex
CREATE INDEX "BizumTransfer_senderUserId_idx" ON "BizumTransfer"("senderUserId");

-- CreateIndex
CREATE INDEX "BizumTransfer_receiverUserId_idx" ON "BizumTransfer"("receiverUserId");

-- CreateIndex
CREATE INDEX "BizumTransfer_senderCardId_idx" ON "BizumTransfer"("senderCardId");

-- CreateIndex
CREATE INDEX "BizumTransfer_receiverCardId_idx" ON "BizumTransfer"("receiverCardId");

-- AddForeignKey
ALTER TABLE "BizumTransfer" ADD CONSTRAINT "BizumTransfer_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BizumTransfer" ADD CONSTRAINT "BizumTransfer_receiverUserId_fkey" FOREIGN KEY ("receiverUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BizumTransfer" ADD CONSTRAINT "BizumTransfer_senderCardId_fkey" FOREIGN KEY ("senderCardId") REFERENCES "targets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BizumTransfer" ADD CONSTRAINT "BizumTransfer_receiverCardId_fkey" FOREIGN KEY ("receiverCardId") REFERENCES "targets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BizumRequest" ADD CONSTRAINT "BizumRequest_requesterUserId_fkey" FOREIGN KEY ("requesterUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BizumRequest" ADD CONSTRAINT "BizumRequest_payerUserId_fkey" FOREIGN KEY ("payerUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BizumRequest" ADD CONSTRAINT "BizumRequest_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "BizumTransfer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
