import { AddressInput } from "@/modules/address/address.schema";
import AddressRepository from "./address.repository";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

class AddressService {
  static async addAddress(userId: string, data: AddressInput) {
    const tenant = await getDefaultTenant();
    if (!tenant) {
      throw new Error("Default tenant not found");
    }
    return AddressRepository.create(userId, data, tenant.id);
  }

  static async updateAddress(
    userId: string,
    addressId: string,
    data: AddressInput,
  ) {
    const tenant = await getDefaultTenant();
    if (!tenant) {
      throw new Error("Default tenant not found");
    }
    return AddressRepository.update(userId, addressId, data, tenant.id);
  }

  static async deleteAddress(userId: string, id: string) {
    const tenant = await getDefaultTenant();
    if (!tenant) {
      throw new Error("Default tenant not found");
    }
    return AddressRepository.delete(userId, id, tenant.id);
  }
}

export default AddressService;
