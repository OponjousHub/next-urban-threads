import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authRepository } from "./auth.repository";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export class AuthService {
  static generateToken(userId: string) {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  }

  static async login(email: string, password: string) {
    const tenant = await getDefaultTenant();
    if (!tenant) {
      throw new Error("Default tenant not found");
    }

    const user = await authRepository.login(email, tenant.id);

    if (!user || user.isDeleted) {
      throw new Error("Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );

    const { password: _, ...userWithoutPassword } = user;

    return {
      message: "Login successful",
      user: userWithoutPassword,
      token,
    };
  }
}
