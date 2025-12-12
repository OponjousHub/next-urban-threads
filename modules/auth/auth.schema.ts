import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(6),
  phone: z.string().min(11),
  address: z.string(),
  city: z.string().min(2),
  country: z.string().min(2),
});

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
