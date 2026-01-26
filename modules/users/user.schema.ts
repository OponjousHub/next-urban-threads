import { optional, z } from "zod";

export const RegisterSchema = z.object({
  fullName: z.string().min(2),
  email: z.email(),
  password: z.string().min(6),
  phone: z.string().min(11),
  street: z.string(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(2),
  country: z.string().min(2),
});

export const UpdateUserSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
