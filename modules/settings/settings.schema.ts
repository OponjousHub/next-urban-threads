import { z } from "zod";

export const settingsSchema = z.object({
  name: z.string().min(2, "Store name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  currency: z.string().min(2),
});
