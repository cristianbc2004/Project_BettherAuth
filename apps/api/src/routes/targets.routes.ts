import { Hono } from "hono";

import { requireSession } from "../middleware/require-session";
import { createTarget, getTargets, updateTarget } from "../modules/targets/targets.service";

export const targetsRoutes = new Hono();

targetsRoutes.use("*", requireSession);

targetsRoutes.get("/", async (c) => {
  const data = await getTargets(c.req.raw);
  return c.json(data);
});

targetsRoutes.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  const data = await createTarget(c.req.raw, body);
  return c.json(data, 201);
});

targetsRoutes.patch("/:id", async (c) => {
  const body = await c.req.json().catch(() => null);
  const data = await updateTarget(c.req.raw, c.req.param("id"), body);
  return c.json(data);
});
