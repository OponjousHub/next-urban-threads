import { prisma } from "@/utils/prisma";
import { AddressInput } from "@/modules/address/address.schema";

const AddressRepository = {
  async create(userId: string, data: AddressInput, tenantId: string) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirst({
        where: { id: userId, tenantId },
        select: { name: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const fullName = data.fullName?.trim() || user.name?.trim() || "";

      if (fullName !== (user.name ?? "")) {
        await tx.user.update({
          where: { id: userId },
          data: { name: fullName },
        });
      }

      await tx.address.updateMany({
        where: {
          userId,
          tenantId,
          isDeleted: false,
          isTemporary: false,
        },
        data: { fullName },
      });

      const count = await tx.address.count({
        where: {
          userId,
          tenantId,
          isDeleted: false,
          isTemporary: false,
        },
      });

      const shouldBeDefault = data.isDefault === true || count === 0;

      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { userId, tenantId },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          tenantId,
          userId,
          street: data.street,
          city: data.city,
          country: data.country,
          fullName,
          state: data.state ?? null,
          phone: data.phone ?? null,
          postalCode: data.postalCode ?? null,
          isDefault: shouldBeDefault,
        },
      });
    });
  },

  async update(
    userId: string,
    addressId: string,
    data: AddressInput,
    tenantId: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirst({
        where: { id: userId, tenantId },
        select: { name: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const existingAddress = await tx.address.findFirst({
        where: {
          id: addressId,
          userId,
          tenantId,
          isDeleted: false,
        },
      });

      if (!existingAddress) {
        throw new Error("Address not found");
      }

      const fullName = data.fullName?.trim() || user.name?.trim() || "";

      if (fullName !== (user.name ?? "")) {
        await tx.user.update({
          where: { id: userId },
          data: { name: fullName },
        });
      }

      await tx.address.updateMany({
        where: {
          userId,
          tenantId,
          isDeleted: false,
          isTemporary: false,
        },
        data: { fullName },
      });

      const shouldBeDefault = data.isDefault === true;

      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { userId, tenantId },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id: addressId, tenantId, userId },
        data: {
          street: data.street,
          city: data.city,
          country: data.country,
          fullName,
          state: data.state ?? null,
          phone: data.phone ?? null,
          postalCode: data.postalCode ?? null,
          isDefault: shouldBeDefault,
        },
      });
    });
  },

  async delete(userId: string, addressId: string, tenantId: string) {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId, tenantId },
    });

    if (!address) {
      throw new Error("Address not found");
    }

    const isDefault = address.isDefault;

    await prisma.address.update({
      where: { id: addressId, tenantId },
      data: { isDeleted: true },
    });

    if (isDefault) {
      const nextAddress = await prisma.address.findFirst({
        where: {
          userId,
          tenantId,
          isDeleted: false,
          isTemporary: false,
        },
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
