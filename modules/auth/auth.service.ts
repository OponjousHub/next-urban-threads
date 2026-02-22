import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authRepository } from "./auth.repository";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";

export class AuthService {
  static generateToken(userId: string) {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  }

  static async login(email: string, password: string) {
    // Generating session
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";

    const rawIp =
      headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "";
    const ip = rawIp.split(",")[0].trim() || "127.0.0.1";

    // Convert IPv6 localhost
    const normalizedIp = ip === "::1" ? "127.0.0.1" : ip;

    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser().name || "Unknown Browser";
    const os = parser.getOS().name || "Unknown OS";
    const deviceLabel = `${browser} on ${os}`;

    //GET TENANT ID
    const tenant = await getDefaultTenant();
    if (!tenant) {
      throw new Error("Default tenant not found");
    }

    //GET USER
    const user = await authRepository.login(email, tenant.id);
    if (!user || user.isDeleted) {
      throw new Error("Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    const session = await authRepository.createSession(
      user.id,
      tenant.id,
      userAgent,
      normalizedIp,
      deviceLabel,
    );

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        tenantId: tenant.id,
        sessionId: session.id,
      },
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
