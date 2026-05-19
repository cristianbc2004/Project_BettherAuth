import type { ErrorHandler } from "hono";

import { HttpError } from "../lib/http-error";

export const errorHandler: ErrorHandler = (error, c) => {
  if (error instanceof HttpError) {
    return new Response(
      JSON.stringify({
        details: error.details ?? null,
        error: error.message,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: error.status,
      },
    );
  }

  console.error("[api] error no controlado", error);

  return c.json({ error: "Error interno del servidor." }, 500);
};
