import { Hono } from "hono";

import { getStadiaMapStyle, proxyStadiaMapResource } from "../modules/maps/stadia-maps.service";

export const mapsRoutes = new Hono();

mapsRoutes.get("/style", async (c) => {
  const style = await getStadiaMapStyle(c.req.url);

  return c.json(style);
});

mapsRoutes.get("/tiles/:source/:z/:x/:y", async (c) => {
  return proxyStadiaMapResource(
    `/data/${c.req.param("source")}/${c.req.param("z")}/${c.req.param("x")}/${c.req.param("y")}`,
  );
});

mapsRoutes.get("/glyphs/:fontstack/:range", async (c) => {
  return proxyStadiaMapResource(
    `/fonts/${encodeURIComponent(c.req.param("fontstack"))}/${c.req.param("range")}`,
  );
});

mapsRoutes.get("/sprites/:style/:sprite", async (c) => {
  return proxyStadiaMapResource(`/styles/${c.req.param("style")}/${c.req.param("sprite")}`);
});
