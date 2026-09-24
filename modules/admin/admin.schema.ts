import { z } from "zod";

export const CreateAdministratorSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

export type CreateAdministratorInput = z.infer<
  typeof CreateAdministratorSchema
>;
