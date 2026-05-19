import { createMiddleware } from "hono/factory";

export const requestContext = createMiddleware(async (c, next) => {
  c.set("requestId", crypto.randomUUID());
  await next();
});
