import ProductRepository from "./product.repository";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { prisma } from "@/utils/prisma";
import { StoreMode } from "@prisma/client";

export default class ProductService {
  static async createProduct(
    data: any,
    tenantId: string,
    storeMode: StoreMode,
  ) {
    return ProductRepository.create(data, tenantId, storeMode);
  }

  static async getProducts(options: any) {
    return ProductRepository.findAll({
      ...options,
      include: {
        category: true,
        vendor: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  static async countProducts(where: any) {
    return prisma.product.count({ where });
  }

  static async getProduct(id: string) {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      throw new Error("Default tenant not found");
    }
    return ProductRepository.findById(id, tenant.id, tenant.storeMode);
  }

  static async updateProduct(id: string, data: any) {
    const tenant = await getDefaultTenant();
    // const { stock, ...rest } = data;
    // console.log("STOCK DATA" stock);

    if (!tenant) {
      throw new Error("Default tenant not found");
    }
    return ProductRepository.update(id, data, tenant.id);
  }

  static async deleteProduct(id: string) {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      throw new Error("Default tenant not found");
    }
    await ProductRepository.seftDelete(id, tenant.id);
  }
}
