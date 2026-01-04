import bcrypt from "bcryptjs";
import { RegisterInput } from "@/modules/users/user.schema";
import { UserRepository } from "./user.repository";
import AuthController from "../auth/auth.controller";
import { NextResponse } from "next/server";

export class UserService {
  static async register(data: RegisterInput) {
    const { name, email, password, phone, address, city, country } = data;

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserRepository.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      city,
      country,
    });

    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  static async getAllUsers() {
    return UserRepository.findAll();
  }

  static async getMe(token: string) {
    const userId = AuthController.getUserIdFromToken(token);

    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  static async updateUser(userId: string, data: any) {
    return UserRepository.update(userId, data);
  }

  static async deleteAccount(token: string) {
    const userId = AuthController.getUserIdFromToken(token);
    await UserRepository.softDelete(userId);
    return "User account deleted successfully.";
  }
}
