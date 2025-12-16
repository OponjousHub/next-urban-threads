import { prisma } from "@/utils/prisma";

class UserController {
  static async getAllUsers() {
    const users = prisma.user.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  }
}

export default UserController;
