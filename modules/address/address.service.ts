import { AddressInput } from "@/modules/address/address.schema";
import AddressRepository from "./address.repository";

class AddressService {
  static async addAddress(userId: string, data: AddressInput) {
    return AddressRepository.create(userId, data);
  }
}

export default AddressService;
