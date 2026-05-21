import { HttpError } from "../../lib/http-error";

const STADIA_MAPS_API_KEY = process.env.STADIA_MAPS_API_KEY?.trim() ?? "";
const STADIA_MAPS_ORIGIN = "https://tiles.stadiamaps.com";
const DEFAULT_STYLE_ID = "alidade_smooth";
const DEFAULT_SOURCE_ID = "openmaptiles";

function getStadiaMapsApiKey() {
  if (!STADIA_MAPS_API_KEY) {
    throw new HttpError(500, "Stadia Maps API key is not configured.");
  }

  return STADIA_MAPS_API_KEY;
}

function withApiKey(path: string) {
  const url = new URL(path, STADIA_MAPS_ORIGIN);
  url.searchParams.set("api_key", getStadiaMapsApiKey());

  return url;
}

function getRequestOrigin(requestUrl: string) {
  const url = new URL(requestUrl);

  return url.origin;
}

function getProxyStyleId(value: unknown) {
  if (typeof value !== "string") {
    return DEFAULT_STYLE_ID;
  }

  return value.match(/\/styles\/([^/]+)\/sprite/)?.[1] ?? DEFAULT_STYLE_ID;
}

function rewriteStyleSource(source: unknown, origin: string) {
  if (!source || typeof source !== "object" || !("tiles" in source)) {
    return source;
  }

  const nextSource = source as { tiles?: unknown };

  if (!Array.isArray(nextSource.tiles)) {
    return source;
  }

  return {
    ...nextSource,
    tiles: nextSource.tiles.map((tileUrl) => {
      if (typeof tileUrl !== "string") {
        return tileUrl;
      }

      const sourceId = tileUrl.match(/\/data\/([^/]+)\//)?.[1] ?? DEFAULT_SOURCE_ID;

      return `${origin}/api/maps/tiles/${sourceId}/{z}/{x}/{y}.pbf`;
    }),
  };
}

function rewriteStyleJson(style: unknown, origin: string) {
  if (!style || typeof style !== "object") {
    throw new HttpError(502, "Invalid Stadia Maps style response.");
  }

  const styleRecord = style as Record<string, unknown>;
  const sources = styleRecord.sources && typeof styleRecord.sources === "object"
    ? Object.fromEntries(
        Object.entries(styleRecord.sources).map(([sourceName, source]) => [
          sourceName,
          rewriteStyleSource(source, origin),
        ]),
      )
    : styleRecord.sources;

  return {
    ...styleRecord,
    glyphs: `${origin}/api/maps/glyphs/{fontstack}/{range}.pbf`,
    sources,
    sprite: `${origin}/api/maps/sprites/${getProxyStyleId(styleRecord.sprite)}/sprite`,
  };
}

export async function getStadiaMapStyle(requestUrl: string) {
  const response = await fetch(withApiKey(`/styles/${DEFAULT_STYLE_ID}.json`));

  if (!response.ok) {
    throw new HttpError(response.status, "Could not load Stadia Maps style.");
  }

  return rewriteStyleJson(await response.json(), getRequestOrigin(requestUrl));
}

export async function proxyStadiaMapResource(path: string) {
  const response = await fetch(withApiKey(path));

  if (!response.ok) {
    throw new HttpError(response.status, "Could not load Stadia Maps resource.");
  }

  const headers = new Headers();
  const contentType = response.headers.get("content-type");
  const cacheControl = response.headers.get("cache-control") ?? "public, max-age=86400";

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  headers.set("Cache-Control", cacheControl);

  return new Response(await response.arrayBuffer(), {
    headers,
    status: response.status,
  });
}
