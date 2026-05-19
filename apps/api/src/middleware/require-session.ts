import { createMiddleware } from "hono/factory";

import { auth } from "../modules/auth/auth";

export const requireSession = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session?.user?.id) {
    return c.json({ error: "No autorizado." }, 401);
  }

  c.set("session", session);
  await next();
});
