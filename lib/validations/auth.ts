import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "La password deve avere almeno 6 caratteri"),
});

export const registerSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "La password deve avere almeno 6 caratteri"),
  username: z
    .string()
    .min(3, "Lo username deve avere almeno 3 caratteri")
    .max(20, "Lo username può avere al massimo 20 caratteri")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Lo username può contenere solo lettere, numeri e underscore"
    ),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
