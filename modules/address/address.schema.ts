import { z } from "zod";

export const AddressSchema = z.object({
  street: z.string().min(3),
  fullName: z.string().optional(),
  city: z.string().min(2),
  state: z.string().optional(),
  country: z.string().min(2),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type AddressInput = z.infer<typeof AddressSchema>;
