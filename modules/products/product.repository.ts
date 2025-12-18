import { prisma } from "@/utils/prisma";
import { Prisma } from "@prisma/client";

export default class ProductRepository {
  static create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({ data });
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
