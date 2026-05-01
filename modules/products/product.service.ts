import ProductRepository from "./product.repository";
import { Prisma } from "@prisma/client";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { prisma } from "@/utils/prisma";

export default class ProductService {
  static async createProduct(data: any, tenantId: string) {
    return ProductRepository.create(data, tenantId);
  }

  // static async getProducts(filters: any) {
  //   return ProductRepository.findAll({
  //     where: filters,
  //     include: { category: true },
  //   });
  // }
  static async getProducts(options: any) {
    return ProductRepository.findAll({
      ...options,
      include: { category: true },
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
