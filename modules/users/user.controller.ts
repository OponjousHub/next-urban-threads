import { prisma } from "@/utils/prisma";
import bcrypt from "bcryptjs";
import { RegisterInput, UpdateUserInput } from "@/modules/auth/auth.schema";
import AuthController from "../auth/auth.controller";

class UserController {
  /**
   * REGISTER USER
   * Receives Zod-validated data from /api/auth/register
   */
  static async register(data: RegisterInput) {
    const { name, email, password, phone, address, city, country } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        error: "Email already exists",
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        city,
        country,
      },
    });

    // Remove password before returning
    const { password: _, ...userWithoutPassword } = user;

    return {
      message: "User registered successfully",
      user: userWithoutPassword,
    };
  }

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

  static async getMe(token: string, data: any) {
    const userId = AuthController.getUserIdFromToken(token);

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      },
    });

    if (!user) {
      throw new Error("User not found!");
    }

    return user;
  }

  // UPDATE USER
  static async updateUser(userId: string, data: any) {
    try {
      const { name, phone, address, city, country } = data;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data,
      });

      return { user: updatedUser, success: true };
    } catch (error) {
      console.error("UPDATE USER ERROR:", error);
      return { user: null, success: false };
    }
  }

  //DELETE USER ACCOUNT
  static async deleteUserAccount(token: string) {
    const userId = AuthController.getUserIdFromToken(token);

    await prisma.user.delete({ where: { id: userId } });

    return "User account deleted successfully.";
  }
}

export default UserController;
