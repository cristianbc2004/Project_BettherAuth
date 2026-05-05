-- CreateTable
CREATE TABLE "BizumTransfer" (
    "id" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "receiverUserId" TEXT NOT NULL,
    "senderCardId" TEXT,
    "receiverCardId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "concept" TEXT,
    "referenceCode" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BizumTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BizumRequest" (
    "id" TEXT NOT NULL,
    "requesterUserId" TEXT NOT NULL,
    "payerUserId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "concept" TEXT,
    "expiresAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "transferId" TEXT,
    "referenceCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BizumRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BizumTransfer_referenceCode_key" ON "BizumTransfer"("referenceCode");

-- CreateIndex
CREATE UNIQUE INDEX "BizumTransfer_idempotencyKey_key" ON "BizumTransfer"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "BizumRequest_referenceCode_key" ON "BizumRequest"("referenceCode");
