import { prisma } from "@/utils/prisma";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "@prisma/client";
import { AuthService } from "./auth.service";
import { getLoggedInUserId } from "@/lib/auth";

type SafeUser = Omit<User, "password">;

class AuthController {
  /**
   * LOGIN USER
   * Receives { email, password } from Zod-validated login route
   */
  static async login(data: { email: string; password: string }) {
    const { email, password } = data;
    const result = await AuthService.login(email, password);

    return result;
  }

  // VERIFY TOKEN
  static verifyToken(token: string): JwtPayload & { id: string } {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & {
      id: string;
    };
  }

  //ONLY ADMIN
  static async restrictToAdmin(token: string) {
    const userId = await getLoggedInUserId();
    // const userId = this.getUserIdFromToken(token);

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
}

export default AuthController;
