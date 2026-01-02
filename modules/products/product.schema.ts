import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  category: z.enum(["MEN", "WOMEN", "ACCESSORIES"]),
  subCategory: z.string().min(1),
  stock: z.number().int().nonnegative(),
  images: z.array(z.string().url()).optional(),
  discountedPrice: z.number().optional(),
  featured: z.boolean().optional().default(false),
  seoTitle: z.number().optional(),
  seoDescription: z.number().optional(),
  colours: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();
