-- CreateTable
CREATE TABLE "Auditoria" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT,
    "userRol" TEXT,
    "action" TEXT NOT NULL,
    "table" TEXT NOT NULL,
    "oldvaluePayload" JSONB,
    "newvaluePayload" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "status" TEXT NOT NULL,
    "errorMensaje" TEXT,
    "targetUserId" TEXT,
    "sessionId" TEXT,
    "endpoint" TEXT,
    "source" TEXT,

    CONSTRAINT "Auditoria_pkey" PRIMARY KEY ("id")
);
