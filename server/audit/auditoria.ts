import { prisma } from "@server/db/prisma";

type HeadersLike = Headers | Record<string, string | string[] | undefined> | undefined;

type RegistroAuditoriaInput = {
  action:
    | "ADMIN_LIST"
    | "ADMIN_CREATE"
    | "ADMIN_DELETE"
    | "BIZUM_REQUEST_CREATE"
    | "BIZUM_TRANSFER_SEND"
    | "CARD_CREATE"
    | "AUTH_LOGIN"
    | "PASSWORD_RESET"
    | "PASSWORD_CHANGE"
    | "AUTH_REGISTER"
    | "TWO_FACTOR_ENABLE";
  status: string;
  table: string;
  userId?: string | null;
  userName?: string | null;
  userRol?: string | null;
  oldvaluePayload?: unknown;
  newvaluePayload?: unknown;
  targetUserId?: string | null;
  sessionId?: string | null;
  endpoint?: string | null;
  source?: string | null;
  errorMensaje?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

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

export async function registrarAuditoria(input: RegistroAuditoriaInput) {
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Auditoria"
      ("id", "userId", "userName", "userRol", "action", "table", "oldvaluePayload", "newvaluePayload", "ipAddress", "userAgent", "status", "errorMensaje", "targetUserId", "sessionId", "endpoint", "source")
      VALUES
      ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9, $10, $11, $12, $13, $14, $15, $16)`,
      crypto.randomUUID(),
      input.userId ?? null,
      input.userName ?? null,
      input.userRol ?? null,
      input.action,
      input.table,
      input.oldvaluePayload ? JSON.stringify(input.oldvaluePayload) : null,
      input.newvaluePayload ? JSON.stringify(input.newvaluePayload) : null,
      input.ipAddress ?? null,
      input.userAgent ?? null,
      input.status,
      input.errorMensaje ?? null,
      input.targetUserId ?? null,
      input.sessionId ?? null,
      input.endpoint ?? null,
      input.source ?? null,
    );
  } catch (error) {
    // La auditoria no debe romper el flujo principal.
    console.error("[auditoria] No se pudo guardar el evento.", error);
  }
}
