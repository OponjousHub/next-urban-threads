import ProductRepository from "./product.repository";
import { Prisma } from "@prisma/client";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export default class ProductService {
  static async createProduct(data: any, tenantId: string) {
    return ProductRepository.create(data, tenantId);
  }

  static async getProducts(categoryFilter?: Prisma.ProductWhereInput) {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      throw new Error("Default tenant not found");
    }
    return ProductRepository.findAll({
      where: {
        tenantId: tenant.id,
        ...categoryFilter, // 🔥 THIS is the key
      },
      include: {
        category: true,
      },
    });
  }

  static async getProduct(id: string) {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      throw new Error("Default tenant not found");
    }
    return ProductRepository.findById(id, tenant.id);
  }

  static async updateProduct(id: string, data: any) {
    const tenant = await getDefaultTenant();

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
