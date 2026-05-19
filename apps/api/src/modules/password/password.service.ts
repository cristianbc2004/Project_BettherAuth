import { z } from "zod";

import { HttpError } from "../../lib/http-error";

const checkEmailSchema = z.object({
  email: z.email(),
});

const resetDirectSchema = z.object({
  newPassword: z.string().min(8),
  token: z.string().min(1),
});

export async function checkEmail(input: unknown) {
  const result = checkEmailSchema.safeParse(input);

  if (!result.success) {
    throw new HttpError(400, "Datos invalidos.", result.error.flatten());
  }

  return {
    email: result.data.email,
    exists: true,
    message: "Endpoint listo para implementar la comprobacion real en base de datos.",
  };
}

export async function resetPasswordDirect(input: unknown) {
  const result = resetDirectSchema.safeParse(input);

  if (!result.success) {
    throw new HttpError(400, "Datos invalidos.", result.error.flatten());
  }

  return {
    message: "Endpoint listo para mover la logica real de reset-password.",
  };
}
