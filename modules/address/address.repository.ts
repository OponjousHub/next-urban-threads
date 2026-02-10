import { prisma } from "@/utils/prisma";
import { AddressInput } from "@/modules/address/address.schema";

const AddressRepository = {
  async create(userId: string, data: AddressInput, tenantId: string) {
    const count = await prisma.address.count({
      where: { userId, tenantId },
    });

    const shouldBeDefault = data.isDefault === true || count === 0;

    if (shouldBeDefault) {
      await prisma.address.updateMany({
        where: { userId, tenantId },
        data: { isDefault: false },
      });
    }

    return prisma.address.create({
      data: {
        tenantId,
        userId,
        street: data.street,
        city: data.city,
        country: data.country,
        fullName: data.fullName ?? "",
        state: data.state ?? null,
        phone: data.phone ?? null,
        postalCode: data.postalCode ?? null,
        isDefault: shouldBeDefault,
      },
    });
  },

  async update(
    userId: string,
    addressId: string,
    data: AddressInput,
    tenantId: string,
  ) {
    const shouldBeDefault = data.isDefault === true;

    if (shouldBeDefault) {
      await prisma.address.updateMany({
        where: { userId, tenantId },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: {
        id: addressId,
        tenantId,
        userId, // 👈 prevents editing other users’ addresses
      },
      data: {
        tenant: {
          connect: { id: tenantId },
        },
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

  async delete(userId: string, addressId: string, tenantId: string) {
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
        tenantId,
      },
    });

    if (!address) {
      throw new Error("Address not found");
    }

    const isDefault = address.isDefault;

    // Delete address (SOFT DELETE)
    await prisma.address.update({
      where: { id: addressId, tenantId },
      data: { isDeleted: true },
    });

    // If deleted address was default, promote another one
    if (isDefault) {
      const nextAddress = await prisma.address.findFirst({
        where: { userId, tenantId },
        orderBy: { createdAt: "asc" },
      });

      if (nextAddress) {
        await prisma.address.update({
          where: { id: nextAddress.id, tenantId },
          data: { isDefault: true },
        });
      }
    }

    return true;
  },
};

export default AddressRepository;
