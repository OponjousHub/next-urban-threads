import { AddressInput } from "@/modules/address/address.schema";
import AddressService from "./address.service";

class AddressController {
  static async addAddress(userId: string, data: AddressInput) {
    const address = await AddressService.addAddress(userId, data);
    return address;
  }
}

export default AddressController;
