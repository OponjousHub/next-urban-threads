import { AddressSchema } from "@/modules/address/address.schema";
import AddressRepository from "./address.repository";

class AddressService {
  static async addAddress(data: AddressSchema) {
    return AddressRepository.create(data);
  }
}

export default AddressService;
