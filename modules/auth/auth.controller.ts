import { prisma } from "@/utils/prisma";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "@prisma/client";
import { AuthService } from "./auth.service";

type SafeUser = Omit<User, "password">;

class AuthController {
  /**
   * LOGIN USER
   * Receives { email, password } from Zod-validated login route
   */
  static async login(data: { email: string; password: string }) {
    const { email, password } = data;
    const result = AuthService.login(email, password);

    return result;
  }

  // VERIFY TOKEN
  static verifyToken(token: string): JwtPayload & { id: string } {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & {
      id: string;
    };
  }

  //ONLY ADMIN
  // static async restrictToAdmin(token: string) {
  //   const userId = this.getUserIdFromToken(token);
  //   const user = await prisma.user.findUnique({
  //     where: { id: userId },
  //     select: { role: true },
  //   });

  //   if (!user || user.role !== "ADMIN") {
  //     throw new Error("Forbidden");
  //   }
  // }

  static async restrictToAdmin(token: string) {
    const userId = this.getUserIdFromToken(token);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Forbidden");
    }
  }

  // GET USER ID FROM TOKEN
  // static getUserIdFromToken(token: string): string {
  //   if (!token) {
  //     throw new Error("Unautorized!");
  //   }

  //   const payload = this.verifyToken(token);
  //   if (!payload.id) {
  //     throw new Error("Invalid token!");
  //   }

  //   return payload.id;
  // }
  static getUserIdFromToken(token: string): string | null {
    try {
      const payload = this.verifyToken(token);
      return payload?.id ?? null;
    } catch {
      return null;
    }
  }
}

export default AuthController;
