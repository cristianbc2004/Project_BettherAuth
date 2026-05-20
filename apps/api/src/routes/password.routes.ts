import { Hono } from "hono";

import { checkEmail, resetPasswordDirect } from "../modules/password/password.service";

export const passwordRoutes = new Hono();

passwordRoutes.get("/check-email", async (c) => {
  const email = c.req.query("email");
  const data = await checkEmail({ email });
  return c.json(data);
});

passwordRoutes.post("/check-email", async (c) => {
  const body = await c.req.json().catch(() => null);
  const data = await checkEmail(body);
  return c.json(data);
});

passwordRoutes.post("/reset-direct", async (c) => {
  const body = await c.req.json().catch(() => null);
  const data = await resetPasswordDirect(body, c.req.raw);
  return c.json(data);
});
