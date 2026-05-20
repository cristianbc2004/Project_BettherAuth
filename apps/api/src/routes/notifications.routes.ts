import { Hono } from "hono";

import { requireSession } from "../middleware/require-session";
import { getNotifications } from "../modules/notifications/notifications.service";

export const notificationRoutes = new Hono();

notificationRoutes.use("*", requireSession);

notificationRoutes.get("/", async (c) => {
  const data = await getNotifications(c.req.raw);
  return c.json(data);
});
