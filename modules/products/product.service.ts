import ProductRepository from "./product.repository";
import { Category } from "@prisma/client";

export default class ProductService {
  static async createProduct(data: any) {
    return ProductRepository.create(data);
  }

  static async getProducts(category?: Category) {
    return ProductRepository.findAll(category ? { category } : undefined);
  }

  static async getProduct(id: string) {
    return ProductRepository.findById(id);
  }

  static async updateProduct(id: string, data: any) {
    return ProductRepository.update(id, data);
  }

  static async deleteProduct(id: string) {
    await ProductRepository.seftDelete(id);
  }
}
