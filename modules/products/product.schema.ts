import { z } from "zod";

/* =========================================================
   PRODUCT VARIANT
   ========================================================= */

export const ProductVariantSchema = z.object({
  color: z.string().min(1, "Variant colour is required"),

  colorHex: z.string().min(1, "Variant colour hex is required"),

  size: z.string().min(1, "Variant size is required"),

  stock: z.number().int().nonnegative("Variant stock cannot be negative"),

  price: z.number().nonnegative("Variant price cannot be negative"),

  image: z.string().optional(),
});

/* =========================================================
   CREATE PRODUCT
   ========================================================= */

export const CreateProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),

  description: z.string().optional(),

  price: z.number().nonnegative("Price cannot be negative").optional(),

  category: z.string().min(1, "Category is required"),

  subCategory: z.string().min(1, "Sub category is required"),

  /*
   * For a simple product:
   * this is the actual product stock.
   *
   * For a variant product:
   * the controller calculates stock from variants.
   */
  stock: z.number().int().nonnegative("Stock cannot be negative"),

  images: z.array(z.string().url()).optional(),

  discountedPrice: z.number().nonnegative().optional(),

  featured: z.boolean().optional().default(false),

  flash: z.boolean().optional().default(false),

  /*
   * false = simple product
   * true = product with variants
   */
  hasVariants: z.boolean().optional().default(false),

  /*
   * SEO fields should be strings, not numbers.
   */
  seoTitle: z.string().optional(),

  seoDescription: z.string().optional(),

  colours: z.array(z.string()).optional(),

  sizes: z.array(z.string()).optional(),

  videos: z
    .array(
      z.object({
        url: z.string(),
        public_id: z.string(),
      }),
    )
    .optional(),

  /*
   * IMPORTANT:
   *
   * Variants are optional.
   *
   * A simple product can send:
   *
   * variants: []
   *
   * or omit variants completely.
   */
  variants: z.array(ProductVariantSchema).optional().default([]),
});

/* =========================================================
   UPDATE PRODUCT
   ========================================================= */

export const UpdateProductSchema = CreateProductSchema.partial();
