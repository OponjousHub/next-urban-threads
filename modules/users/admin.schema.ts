import { z } from "zod";

export const CreateAdminSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters.")
    .max(100, "Full name is too long."),

  email: z
    .email("Please enter a valid email address.")
    .transform((value) => value.trim().toLowerCase()),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .max(100, "Password is too long."),

  phone: z.string().optional().or(z.literal("")),

  country: z.string().optional().or(z.literal("")),
});

export type CreateAdminInput = z.infer<typeof CreateAdminSchema>;
