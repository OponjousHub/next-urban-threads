import { prisma } from "@/utils/prisma";
import { Prisma, StoreMode } from "@prisma/client";
import slugify from "slugify";

export default class ProductRepository {
  static create(
    data: Omit<Prisma.ProductCreateInput, "tenant">,
    tenantId: string,
    storeMode: StoreMode | undefined,
  ) {
    const slug = slugify(data.name, { lower: true, strict: true });

    const imagesArray: string[] = Array.isArray(data.images)
      ? data.images
      : (data.images?.set ?? []);

    const thumbnail = data.thumbnail ?? imagesArray[0];

    return prisma.product.create({
      data: {
        ...data,

        tenant: {
          connect: { id: tenantId },
        },
        storeMode: storeMode,
        slug,
        thumbnail,
        images: imagesArray.length ? { set: imagesArray } : undefined,
      },
      include: {
        user: true,
      },
    });
  }

  static findAll(filters: Prisma.ProductFindManyArgs) {
    return prisma.product.findMany(filters);
  }

  static findById(id: string, tenantId: string, storeMode: StoreMode) {
    return prisma.product.findFirst({
      where: {
        id,
        tenantId,
        storeMode,
        deletedAt: null,
      },
      include: {
        category: true,
        variants: true,
      },
    });
  }

  static update(id: string, data: Prisma.ProductUpdateInput, tenantId: string) {
    return prisma.product.update({
      where: { id, deletedAt: null, tenantId },
      data,
    });
  }

  static seftDelete(id: string, tenantId: string) {
    return prisma.product.update({
      where: { id, tenantId },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
