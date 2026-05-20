import { prisma } from "@repo/database";
import { z } from "zod";

type HeadersLike = Headers | Record<string, string | string[] | undefined> | undefined;

const auditActionSchema = z.enum([
  "ADMIN_LIST",
  "ADMIN_CREATE",
  "ADMIN_DELETE",
  "AUTH_LOGIN",
  "AUTH_REGISTER",
  "BIZUM_REQUEST_CREATE",
  "BIZUM_TRANSFER_SEND",
  "CARD_CREATE",
  "PASSWORD_CHANGE",
  "PASSWORD_RESET",
  "TWO_FACTOR_ENABLE",
]);

const registerAuditInputSchema = z.object({
  action: auditActionSchema,
  endpoint: z.string().nullable().optional(),
  errorMensaje: z.string().nullable().optional(),
  ipAddress: z.string().nullable().optional(),
  newvaluePayload: z.unknown().optional(),
  oldvaluePayload: z.unknown().optional(),
  sessionId: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  status: z.enum(["SUCCESS", "FAILED"]),
  table: z.string(),
  targetUserId: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  userId: z.string().nullable().optional(),
  userName: z.string().nullable().optional(),
  userRol: z.string().nullable().optional(),
});

type RegisterAuditInput = z.infer<typeof registerAuditInputSchema>;

function getHeaderValue(headers: HeadersLike, key: string) {
  if (!headers) {
    return null;
  }

  if (headers instanceof Headers) {
    const value = headers.get(key);
    return value?.trim() || null;
  }

  const raw = headers[key] ?? headers[key.toLowerCase()] ?? headers[key.toUpperCase()];

  if (Array.isArray(raw)) {
    return raw[0]?.trim() || null;
  }

  if (typeof raw === "string") {
    return raw.trim() || null;
  }

  return null;
}

export function extractAuditRequestMeta(request: Request, source = "api") {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const userAgent = request.headers.get("user-agent")?.trim();
  const endpoint = new URL(request.url).pathname;

  return {
    endpoint,
    ipAddress: forwardedFor || realIp || null,
    source,
    userAgent: userAgent || null,
  };
}

export function extractAuditMetaFromHeaders(headers: HeadersLike, fallbackEndpoint: string, source = "auth") {
  const forwardedFor = getHeaderValue(headers, "x-forwarded-for");
  const realIp = getHeaderValue(headers, "x-real-ip");
  const userAgent = getHeaderValue(headers, "user-agent");

  return {
    endpoint: fallbackEndpoint,
    ipAddress: (forwardedFor?.split(",")[0]?.trim() || realIp) ?? null,
    source,
    userAgent: userAgent || null,
  };
}

export async function registerAudit(input: RegisterAuditInput) {
  try {
    const auditInput = registerAuditInputSchema.parse(input);

    await prisma.$executeRawUnsafe(
      `INSERT INTO "Auditoria"
      ("id", "userId", "userName", "userRol", "action", "table", "oldvaluePayload", "newvaluePayload", "ipAddress", "userAgent", "status", "errorMensaje", "targetUserId", "sessionId", "endpoint", "source")
      VALUES
      ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9, $10, $11, $12, $13, $14, $15, $16)`,
      crypto.randomUUID(),
      auditInput.userId ?? null,
      auditInput.userName ?? null,
      auditInput.userRol ?? null,
      auditInput.action,
      auditInput.table,
      auditInput.oldvaluePayload ? JSON.stringify(auditInput.oldvaluePayload) : null,
      auditInput.newvaluePayload ? JSON.stringify(auditInput.newvaluePayload) : null,
      auditInput.ipAddress ?? null,
      auditInput.userAgent ?? null,
      auditInput.status,
      auditInput.errorMensaje ?? null,
      auditInput.targetUserId ?? null,
      auditInput.sessionId ?? null,
      auditInput.endpoint ?? null,
      auditInput.source ?? null,
    );
  } catch (error) {
    console.error("[audit] no se pudo registrar el evento", error);
  }
}
