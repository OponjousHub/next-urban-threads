// import { z } from "zod";

// export const CreateProductSchema = z.object({
//   name: z.string().min(2),
//   description: z.string().optional(),
//   price: z.number().positive().optional(),
//   category: z.string(),
//   subCategory: z.string().min(1),
//   stock: z.number().int().nonnegative(),
//   images: z.array(z.string().url()).optional(),
//   discountedPrice: z.number().optional(),
//   featured: z.boolean().optional().default(false),
//   flash: z.boolean().optional().default(false),
//   hasVariants: z.boolean().optional().default(false),
//   seoTitle: z.number().optional(),
//   seoDescription: z.number().optional(),
//   colours: z.array(z.string()).optional(),
//   sizes: z.array(z.string()).optional(),
//   videos: z
//     .array(
//       z.object({
//         url: z.string(),
//         public_id: z.string(),
//       }),
//     )
//     .optional(),
//   variants: z
//     .array(
//       z.object({
//         color: z.string(),

//         colorHex: z.string(),

//         size: z.string(),

//         stock: z.number(),

//         price: z.number(),

//         image: z.string().optional(),
//       }),
//     )
//     .optional(),
// });

// export const UpdateProductSchema = CreateProductSchema.partial();
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

export const CreateProductSchema = z
  .object({
    name: z.string().min(2, "Product name must be at least 2 characters"),

    description: z.string().optional(),

    price: z.number().nonnegative("Price cannot be negative").optional(),

    category: z.string().min(1, "Category is required"),

    subCategory: z.string().min(1, "Sub category is required"),

    /*
     * Simple product stock.
     *
     * For a variant product, the controller will calculate
     * the final product stock from the variants.
     */
    stock: z.number().int().nonnegative("Stock cannot be negative"),

    images: z.array(z.string().url()).optional(),

    discountedPrice: z.number().nonnegative().optional(),

    featured: z.boolean().optional().default(false),

    flash: z.boolean().optional().default(false),

    /*
     * false = simple product
     * true  = product with variants
     */
    hasVariants: z.boolean().optional().default(false),

    /*
     * These were numbers in your old schema,
     * but SEO title/description should be text.
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
     * No .min(1) here because simple products
     * are allowed to have zero variants.
     */
    variants: z.array(ProductVariantSchema).optional().default([]),
  })
  .superRefine((data, ctx) => {
    /*
     * -------------------------------------------------------
     * VARIANT PRODUCT
     * -------------------------------------------------------
     *
     * If the admin explicitly says this product has variants,
     * at least one variant must exist.
     */
    if (data.hasVariants === true) {
      if (!data.variants || data.variants.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variants"],
          message: "A product with variants must have at least one variant",
        });

        return;
      }

      /*
       * Validate that every variant has sensible stock/price.
       */
      for (const [index, variant] of data.variants.entries()) {
        if (variant.stock < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["variants", index, "stock"],
            message: "Variant stock cannot be negative",
          });
        }

        if (variant.price < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["variants", index, "price"],
            message: "Variant price cannot be negative",
          });
        }
      }
    }

    /*
     * -------------------------------------------------------
     * SIMPLE PRODUCT
     * -------------------------------------------------------
     *
     * If hasVariants is false, variants are ignored/removed
     * by the controller.
     */
    if (data.hasVariants === false) {
      /*
       * We intentionally do NOT reject variants here.
       *
       * This gives the backend some tolerance for older
       * clients that may still send variant data.
       *
       * The controller determines the authoritative product
       * type using hasVariants.
       */
    }
  });

/* =========================================================
   UPDATE PRODUCT
   ========================================================= */

export const UpdateProductSchema = CreateProductSchema.partial();
