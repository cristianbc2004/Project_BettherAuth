import { z } from "zod";

export const apiErrorSchema = z.object({
  error: z.string().optional(),
});

export type ApiErrorResponse = z.infer<typeof apiErrorSchema>;

export async function parseApiError(response: Response) {
  const payload = await response.json().catch(() => null);
  const result = apiErrorSchema.safeParse(payload);

  return result.success ? result.data : null;
}
