import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive(),
  category: z.enum(["MEN", "WOMEN", "ACCESSORIES"]),
  subCategory: z.string().min(1),
  stock: z.number().int().nonnegative(),
  images: z.array(z.string().url()).optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();
