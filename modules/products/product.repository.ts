import { prisma } from "@/utils/prisma";
import { Prisma } from "@prisma/client";
import slugify from "slugify";

export default class ProductRepository {
  static create(data: Prisma.ProductCreateInput) {
    const slug = slugify(data.name, { lower: true, strict: true });

    const imagesArray: string[] = Array.isArray(data.images)
      ? data.images
      : data.images?.set ?? [];

    const thumbnail = data.thumbnail ?? imagesArray[0];

    return prisma.product.create({
      data: {
        ...data,
        slug,
        thumbnail,
        images: imagesArray.length ? { set: imagesArray } : undefined,
      },
    });
  }

  static findAll(where?: Prisma.ProductWhereInput) {
    return prisma.product.findMany({
      where: {
        deletedAt: null,
        ...where,
      },
    });
  }

  static findById(id: string) {
    return prisma.product.findUnique({ where: { id, deletedAt: null } });
  }

  static update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({
      where: { id, deletedAt: null },
      data,
    });
  }

  static seftDelete(id: string) {
    return prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
