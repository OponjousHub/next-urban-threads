import { AddressSchema } from "@/modules/address/address.schema";
import AddressService from "./address.service";

class AddressController {
  static async addAddress(data: AddressSchema) {
    const address = await AddressService.addAddress(data);
    return address;
  }
}

export default AddressController;
