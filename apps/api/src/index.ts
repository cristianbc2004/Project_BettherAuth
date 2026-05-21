import { Hono } from "hono";

import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/error-handler";
import { requestContext } from "./middleware/request-context";
import { authRoutes } from "./routes/auth.routes";
import { bizumRoutes } from "./routes/bizum.routes";
import { mapsRoutes } from "./routes/maps.routes";
import { notificationRoutes } from "./routes/notifications.routes";
import { passwordRoutes } from "./routes/password.routes";
import { targetsRoutes } from "./routes/targets.routes";

const app = new Hono();

app.use("*", requestContext);
app.use("*", corsMiddleware);

app.get("/health", (c) => {
  return c.json({
    service: "api",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.route("/api/auth", authRoutes);
app.route("/api/bizum", bizumRoutes);
app.route("/api/maps", mapsRoutes);
app.route("/api/notifications", notificationRoutes);
app.route("/api/password", passwordRoutes);
app.route("/api/targets", targetsRoutes);

app.notFound((c) => {
  return c.json({ error: "Ruta no encontrada." }, 404);
});

app.onError(errorHandler);

export default app;

if (import.meta.main) {
  const port = Number(process.env.PORT ?? "3001");
  const hostname = process.env.HOST ?? "0.0.0.0";
  const bunRuntime = (globalThis as typeof globalThis & {
    Bun?: {
      serve: (options: { fetch: typeof app.fetch; hostname?: string; port: number }) => unknown;
    };
  }).Bun;

  if (!bunRuntime) {
    throw new Error("Bun runtime is required to start the API server.");
  }

  bunRuntime.serve({
    fetch: app.fetch,
    hostname,
    port,
  });

  console.log(`[api] escuchando en http://${hostname}:${port}`);
}
