import { Hono } from "hono";

import { requireSession } from "../middleware/require-session";
import { createBizum, getBizumSummary } from "../modules/bizum/bizum.service";
import { getBizumRequestDetail, payBizumRequest } from "../modules/bizum/bizum-request.service";

export const bizumRoutes = new Hono();

bizumRoutes.use("*", requireSession);

bizumRoutes.get("/", async (c) => {
  const data = await getBizumSummary(c.req.raw);
  return c.json(data);
});

bizumRoutes.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  const data = await createBizum(c.req.raw, body);
  return c.json(data, 201);
});

bizumRoutes.get("/request/:id", async (c) => {
  const data = await getBizumRequestDetail(c.req.raw, c.req.param("id"));
  return c.json(data);
});

bizumRoutes.post("/request/:id", async (c) => {
  const data = await payBizumRequest(c.req.raw, c.req.param("id"));
  return c.json(data);
});
