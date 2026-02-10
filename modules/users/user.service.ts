import bcrypt from "bcryptjs";
import { RegisterInput } from "@/modules/users/user.schema";
import { UserRepository } from "./user.repository";
import { getLoggedInUserId } from "@/lib/auth";
import welcomeEmail from "@/app/lib/email/template/welcome";
import { sendEmail } from "@/app/lib/email/sendEmail";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

export class UserService {
  static async register(data: RegisterInput) {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      throw new Error("Default tenant not found");
    }

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

    const user = await UserRepository.create(
      {
        fullName,
        email,
        password: hashedPassword,
        phone,
        street,
        postalCode,
        state,
        city,
        country,
      },
      tenant.id,
    );

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
    const tenant = await getDefaultTenant();

    if (!tenant) {
      throw new Error("Default tenant not found");
    }
    return UserRepository.findAll(tenant.id);
  }

  static async getMe(token: string) {
    const userId = await getLoggedInUserId();
    const tenant = await getDefaultTenant();

    if (!tenant) {
      throw new Error("Default tenant not found");
    }

    if (!userId) {
      return "User not found!";
    }

    const user = await UserRepository.findById(userId, tenant.id);
    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  static async updateUser(userId: string, data: any) {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      throw new Error("Default tenant not found");
    }
    return UserRepository.update(userId, data, tenant.id);
  }

  static async deleteAccount(token: string) {
    const userId = await getLoggedInUserId();
    const tenant = await getDefaultTenant();

    if (!tenant) {
      throw new Error("Default tenant not found");
    }

    if (!userId) {
      return "User not found!";
    }

    await UserRepository.softDelete(userId, tenant.id);
    return "User account deleted successfully.";
  }
}
