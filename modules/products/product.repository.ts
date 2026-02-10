import { prisma } from "@/utils/prisma";
import { Prisma } from "@prisma/client";
import slugify from "slugify";

export default class ProductRepository {
  static create(
    data: Omit<Prisma.ProductCreateInput, "tenant">,
    tenantId: string,
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
        slug,
        thumbnail,
        images: imagesArray.length ? { set: imagesArray } : undefined,
      },
      include: {
        user: true,
      },
    });
  }

  static findAll(tenantId: string, where?: Prisma.ProductWhereInput) {
    return prisma.product.findMany({
      where: {
        deletedAt: null,
        tenantId,
        ...where,
      },
    });
  }

  static findById(id: string, tenantId: string) {
    return prisma.product.findUnique({
      where: { id, deletedAt: null, tenantId },
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
