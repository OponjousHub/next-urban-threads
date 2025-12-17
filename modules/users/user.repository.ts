import { prisma } from "@/utils/prisma";

export const UserRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  create(data: any) {
    return prisma.user.create({
      data,
    });
  },

  findAll() {
    return prisma.user.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        country: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        address: true,
        country: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        isDeleted: false,
      },
    });
  },

  update(id: string, data: any) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  },
};
