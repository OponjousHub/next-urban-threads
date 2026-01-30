import { AddressInput } from "@/modules/address/address.schema";
import AddressRepository from "./address.repository";

class AddressService {
  static async addAddress(userId: string, data: AddressInput) {
    return AddressRepository.create(userId, data);
  }

  static async updateAddress(
    userId: string,
    addressId: string,
    data: AddressInput,
  ) {
    return AddressRepository.update(userId, addressId, data);
  }
  static async deleteAddress(userId: string, id: string) {
    return AddressRepository.delete(userId, id);
  }
}

export default AddressService;
