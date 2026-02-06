import bcrypt from "bcryptjs";
import { RegisterInput } from "@/modules/users/user.schema";
import { UserRepository } from "./user.repository";
import { getLoggedInUserId } from "@/lib/auth";
import welcomeEmail from "@/app/lib/email/template/welcome";
import { sendEmail } from "@/app/lib/email/sendEmail";

// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

export class UserService {
  static async register(data: RegisterInput) {
    const {
      fullName,
      email,
      password,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
    } = data;

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserRepository.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      street,
      postalCode,
      state,
      city,
      country,
    });

    //  Send welcome email
    const template = welcomeEmail(user.name || "Customer");

    await sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
    });

    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  static async getAllUsers() {
    return UserRepository.findAll();
  }

  static async getMe(token: string) {
    const userId = await getLoggedInUserId();

    if (!userId) {
      return "User not found!";
    }

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
    const userId = await getLoggedInUserId();

    if (!userId) {
      return "User not found!";
    }

    await UserRepository.softDelete(userId);
    return "User account deleted successfully.";
  }
}
