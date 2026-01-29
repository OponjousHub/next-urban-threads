import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";

const AddressRepository = {
  async create(data: any) {
    const userId = await getLoggedInUserId();

    if (!userId) return null;

    if (data.isDefault) {
      prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return prisma.address.create({
      data: {
        ...data,
        userId,
      },
    });
  },
};

export default AddressRepository;
