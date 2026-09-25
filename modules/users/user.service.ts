import bcrypt from "bcryptjs";
import { RegisterInput } from "@/modules/users/user.schema";
import { UserRepository } from "./user.repository";
import { getLoggedInUserId } from "@/lib/auth";
import welcomeEmail from "@/app/lib/email/template/welcome";
import { sendEmail } from "@/app/lib/email/sendEmail";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { AdminNotificationService } from "@/app/lib/admin/admin-notification-service";
import { CreateAdminInput } from "@/modules/users/admin.schema";

export class UserService {
  static async createAdmin(data: CreateAdminInput) {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      throw new Error("Default tenant not found");
    }

    const normalizedEmail = data.email.trim().toLowerCase();

    const existingUser = await UserRepository.findByEmail(
      normalizedEmail,
      tenant.id,
    );

    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const admin = await UserRepository.createAdmin({
      fullName: data.fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: data.phone?.trim() || null,
      country: data.country?.trim() || null,
      tenantId: tenant.id,
    });

    return admin;
  }

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

    const existingUser = await UserRepository.findByEmail(email, tenant.id);
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

    // Admin Notification
    await AdminNotificationService.notify({
      type: "NEW_CUSTOMER",
      title: "👤 New Customer",
      message: `${user.name ?? "A new customer"} just created an account.`,
      link: `/admin/customers/${user.id}`,
      metadata: {
        customerId: user.id,
        customerName: user.name,
        email: user.email,
      },
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
