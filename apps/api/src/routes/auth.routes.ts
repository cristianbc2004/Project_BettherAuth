import { Hono } from "hono";

import { handleAuthRequest } from "../modules/auth/auth-request.service";

export const authRoutes = new Hono();

authRoutes.on(["GET", "POST"], "/*", async (c) => {
  return handleAuthRequest(c.req.raw);
});
