import { prisma } from "@/utils/prisma";
import { AddressInput } from "@/modules/address/address.schema";

const AddressRepository = {
  async create(userId: string, data: AddressInput) {
    const count = await prisma.address.count({
      where: { userId },
    });

    const shouldBeDefault = data.isDefault === true || count === 0;

    if (shouldBeDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return prisma.address.create({
      data: {
        userId,
        street: data.street,
        city: data.city,
        country: data.country,
        fullName: data.fullName ?? "",
        state: data.state ?? null,
        phone: data.phone ?? null,
        isDefault: shouldBeDefault,
      },
    });
  },

  async update(userId: string, addressId: string, data: AddressInput) {
    const shouldBeDefault = data.isDefault === true;

    if (shouldBeDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: {
        id: addressId,
        userId, // 👈 prevents editing other users’ addresses
      },
      data: {
        street: data.street,
        city: data.city,
        country: data.country,
        fullName: data.fullName ?? "",
        state: data.state ?? null,
        phone: data.phone ?? null,
        isDefault: shouldBeDefault,
      },
    });
  },
};

export default AddressRepository;
