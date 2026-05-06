-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TRANSFER', 'BIZUM_REQUEST', 'BIZUM_SENT', 'BIZUM_RECEIVED', 'ALERT');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userDestinationId" TEXT NOT NULL,
    "userEmisorId" TEXT,
    "type" "NotificationType" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "title" TEXT NOT NULL,
    "body" TEXT,
    "actionRoute" TEXT,
    "actionPayload" JSONB,
    "transferId" TEXT,
    "bizumRequestId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_userDestinationId_createdAt_idx" ON "notifications"("userDestinationId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_userDestinationId_status_createdAt_idx" ON "notifications"("userDestinationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_transferId_idx" ON "notifications"("transferId");

-- CreateIndex
CREATE INDEX "notifications_bizumRequestId_idx" ON "notifications"("bizumRequestId");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userDestinationId_fkey" FOREIGN KEY ("userDestinationId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userEmisorId_fkey" FOREIGN KEY ("userEmisorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "BizumTransfer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_bizumRequestId_fkey" FOREIGN KEY ("bizumRequestId") REFERENCES "BizumRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
