// import { prisma } from "@/utils/prisma";
// import { NextResponse } from "next/server";
// import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
// import InventoryService from "@/lib/inventory/inventory.service";

// type Variant = {
//   id?: string;
//   color: string;
//   colorHex: string;
//   size: string;
//   stock: number;
//   price: number;
//   image?: string;
// };

// export async function PATCH(
//   req: Request,
//   { params }: { params: { id: string } },
// ) {
//   const paramsId = await params;

//   const tenant = await getDefaultTenant();

//   if (!tenant) {
//     throw new Error("Default tenant not found");
//   }

//   try {
//     const body = await req.json();

//     const {
//       name,
//       category,
//       subCategory,
//       price,
//       images,
//       description,
//       sizes,
//       colours,
//       featured,
//       flash,
//       videos,
//       variants,
//     } = body;

//     const updated = await prisma.$transaction(async (tx) => {
//       // Update product details
//       const product = await tx.product.update({
//         where: {
//           id: paramsId.id,
//           tenantId: tenant.id,
//         },
//         data: {
//           name,
//           category: {
//             connect: {
//               id: category,
//             },
//           },
//           subCategory,
//           price,
//           images,
//           description,
//           sizes,
//           colours,
//           featured,
//           videos,
//           isFlashDeal: flash,
//         },
//       });

//       // Replace variants
//       if (variants?.length) {
//         await tx.productVariant.deleteMany({
//           where: {
//             productId: paramsId.id,
//           },
//         });

//         await tx.productVariant.createMany({
//           data: variants.map((variant: Variant) => ({
//             productId: paramsId.id,
//             color: variant.color,
//             colorHex: variant.colorHex,
//             size: variant.size,
//             stock: variant.stock,
//             price: variant.price,
//             image: variant.image || "",
//           })),
//         });

//         // Calculate total inventory
//         const totalStock = variants.reduce(
//           (sum: number, variant: Variant) => sum + Number(variant.stock || 0),
//           0,
//         );

//         await InventoryService.adjustStock({
//           tx,
//           productId: paramsId.id,
//           stock: totalStock,
//         });
//       }

//       return product;
//     });

//     return Response.json(updated);
//   } catch (err) {
//     console.error(err);

//     return Response.json(
//       {
//         message: "Failed to update product",
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }

// export async function DELETE(
//   req: Request,
//   { params }: { params: { id: string } },
// ) {
//   const tenant = await getDefaultTenant();
//   if (!tenant) {
//     throw new Error("Default tenant not found");
//   }
//   try {
//     const { id } = params;

//     if (!id) {
//       return NextResponse.json(
//         { message: "Product ID is required" },
//         { status: 400 },
//       );
//     }

//     await prisma.product.update({
//       where: { id, tenantId: tenant.id },
//       data: { deletedAt: new Date() },
//     });

//     return NextResponse.json({ message: "Product deleted successfully" });
//   } catch (error) {
//     console.error(error);

//     return NextResponse.json(
//       { message: "Failed to delete product" },
//       { status: 500 },
//     );
//   }
// }
import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import InventoryService from "@/lib/inventory/inventory.service";

type Variant = {
  id?: string;
  color: string;
  colorHex: string;
  size: string;
  stock: number;
  price: number;
  image?: string;
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { message: "Product ID is required" },
      { status: 400 },
    );
  }

  const tenant = await getDefaultTenant();

  if (!tenant) {
    return NextResponse.json(
      { message: "Default tenant not found" },
      { status: 404 },
    );
  }

  try {
    const body = await req.json();

    const {
      name,
      category,
      subCategory,
      price,
      stock,
      images,
      description,
      sizes,
      colours,
      featured,
      flash,
      videos,
      variants,
      hasVariants,
    } = body;

    /*
     * ---------------------------------------------------------
     * NORMALIZE PRODUCT TYPE
     * ---------------------------------------------------------
     *
     * The frontend now sends:
     *
     * hasVariants: true  -> variant product
     * hasVariants: false -> simple product
     *
     * We also protect against older clients that don't send
     * hasVariants by checking whether variants exist.
     */
    const isVariantProduct =
      hasVariants === true ||
      (hasVariants === undefined &&
        Array.isArray(variants) &&
        variants.length > 0);

    /*
     * ---------------------------------------------------------
     * VALIDATE VARIANTS
     * ---------------------------------------------------------
     */

    if (isVariantProduct) {
      if (!Array.isArray(variants) || variants.length === 0) {
        return NextResponse.json(
          {
            message:
              "A product with variants must contain at least one variant.",
          },
          { status: 400 },
        );
      }

      for (const variant of variants as Variant[]) {
        if (!variant.color || !variant.size) {
          return NextResponse.json(
            {
              message: "Every variant must have a colour and size.",
            },
            { status: 400 },
          );
        }

        if (variant.stock === undefined || Number(variant.stock) < 0) {
          return NextResponse.json(
            {
              message: "Variant stock must be zero or greater.",
            },
            { status: 400 },
          );
        }

        if (variant.price === undefined || Number(variant.price) < 0) {
          return NextResponse.json(
            {
              message: "Variant price must be zero or greater.",
            },
            { status: 400 },
          );
        }
      }
    }

    /*
     * ---------------------------------------------------------
     * SIMPLE PRODUCT STOCK
     * ---------------------------------------------------------
     */

    const simpleProductStock = Number(stock ?? 0);

    if (!isVariantProduct && simpleProductStock < 0) {
      return NextResponse.json(
        {
          message: "Product stock cannot be negative.",
        },
        { status: 400 },
      );
    }

    /*
     * ---------------------------------------------------------
     * VARIANT TOTAL STOCK
     * ---------------------------------------------------------
     */

    const totalVariantStock = isVariantProduct
      ? (variants as Variant[]).reduce(
          (sum, variant) => sum + Number(variant.stock || 0),
          0,
        )
      : 0;

    const finalStock = isVariantProduct
      ? totalVariantStock
      : simpleProductStock;

    /*
     * ---------------------------------------------------------
     * CATEGORY VALIDATION
     * ---------------------------------------------------------
     */

    let categoryData: { connect: { id: string } } | undefined;

    if (category) {
      const categoryExists = await prisma.category.findFirst({
        where: {
          id: category,
          tenantId: tenant.id,
        },
      });

      if (!categoryExists) {
        return NextResponse.json(
          { message: "Category not found" },
          { status: 400 },
        );
      }

      categoryData = {
        connect: {
          id: category,
        },
      };
    }

    /*
     * ---------------------------------------------------------
     * UPDATE PRODUCT
     * ---------------------------------------------------------
     */

    const updated = await prisma.$transaction(async (tx) => {
      /*
       * Update the main product.
       */
      const product = await tx.product.update({
        where: {
          id,
          tenantId: tenant.id,
        },
        data: {
          ...(name !== undefined && { name }),

          ...(categoryData && {
            category: categoryData,
          }),

          ...(subCategory !== undefined && {
            subCategory,
          }),

          ...(price !== undefined && {
            price: Number(price),
          }),

          /*
           * IMPORTANT:
           *
           * Simple product:
           *   stock = supplied stock
           *
           * Variant product:
           *   stock = total variant stock
           */
          stock: finalStock,

          instock: finalStock > 0,

          ...(images !== undefined && {
            images,
          }),

          ...(description !== undefined && {
            description,
          }),

          ...(sizes !== undefined && {
            sizes,
          }),

          ...(colours !== undefined && {
            colours,
          }),

          ...(featured !== undefined && {
            featured,
          }),

          ...(videos !== undefined && {
            videos,
          }),

          ...(flash !== undefined && {
            isFlashDeal: flash,
          }),
        },
      });

      /*
       * -------------------------------------------------------
       * VARIANTS
       * -------------------------------------------------------
       *
       * We ALWAYS reconcile variants.
       *
       * If variant product:
       *   delete old variants
       *   create new variants
       *
       * If simple product:
       *   delete ALL old variants
       *
       * This is important when an admin changes:
       *
       * Variant product -> Simple product
       */
      await tx.productVariant.deleteMany({
        where: {
          productId: id,
        },
      });

      if (isVariantProduct) {
        await tx.productVariant.createMany({
          data: (variants as Variant[]).map((variant) => ({
            productId: id,

            color: variant.color,

            colorHex: variant.colorHex || "#000000",

            size: variant.size,

            stock: Number(variant.stock || 0),

            price: Number(variant.price || 0),

            image: variant.image || "",
          })),
        });
      }

      /*
       * -------------------------------------------------------
       * INVENTORY
       * -------------------------------------------------------
       *
       * InventoryService.adjustStock expects the final
       * product-level stock.
       */
      await InventoryService.adjustStock({
        tx,
        productId: id,
        stock: finalStock,
      });

      return product;
    });

    /*
     * Return the updated product with variants so the client
     * receives the complete updated state.
     */
    const result = await prisma.product.findFirst({
      where: {
        id,
        tenantId: tenant.id,
      },
      include: {
        category: true,
        variants: true,
      },
    });

    return NextResponse.json(result ?? updated, { status: 200 });
  } catch (error) {
    console.error("Failed to update product:", error);

    return NextResponse.json(
      {
        message: "Failed to update product",
      },
      {
        status: 500,
      },
    );
  }
}

/* =========================================================
   DELETE PRODUCT
   ========================================================= */

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const tenant = await getDefaultTenant();

  if (!tenant) {
    return NextResponse.json(
      { message: "Default tenant not found" },
      { status: 404 },
    );
  }

  try {
    if (!id) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 },
      );
    }

    /*
     * Verify that the product belongs to this tenant.
     */
    const product = await prisma.product.findFirst({
      where: {
        id,
        tenantId: tenant.id,
        deletedAt: null,
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    /*
     * Soft delete.
     */
    await prisma.product.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Product deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to delete product:", error);

    return NextResponse.json(
      {
        message: "Failed to delete product",
      },
      { status: 500 },
    );
  }
}
