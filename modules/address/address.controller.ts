import { AddressInput } from "@/modules/address/address.schema";
import AddressService from "./address.service";

class AddressController {
  static async addAddress(userId: string, data: AddressInput) {
    const address = await AddressService.addAddress(userId, data);
    return address;
  }
  static async updateAddress(
    userId: string,
    addressId: string,
    data: AddressInput,
  ) {
    const updatedAddress = await AddressService.updateAddress(
      userId,
      addressId,
      data,
    );
    return updatedAddress;
  }
  static async deleteAddress(userId: string, id: string) {
    const address = await AddressService.deleteAddress(userId, id);
    return address;
  }
}

export default AddressController;
