import { prisma } from "@/utils/prisma";
// import { Phone } from "lucide-react";
// import { email } from "zod";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

export const UserRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  create(data: any, tenantId: string) {
    return prisma.user.create({
      data: {
        name: data.fullName,
        email: data.email,
        address: data.address,
        city: data.city,
        country: data.country,
        phone: data.phone,
        password: data.password,

        tenant: {
          connect: { id: tenantId },
        },

        addresses: {
          create: {
            tenant: {
              connect: { id: tenantId },
            },

            fullName: data.fullName,
            street: data.street,
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
            country: data.country,
            phone: data.phone,
            isDefault: true,
          },
        },
      },
    });
  },

  findAll(tenantId: string) {
    return prisma.user.findMany({
      where: { isDeleted: false, tenantId },
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

  findById(id: string, tenantId: string) {
    return prisma.user.findUnique({
      where: { id, tenantId },
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

  update(id: string, data: any, tenantId: string) {
    return prisma.user.update({
      where: { id, tenantId },
      data,
    });
  },

  softDelete(id: string, tenantId: string) {
    return prisma.user.update({
      where: { id, tenantId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  },
};
