import bcrypt from "bcryptjs";
import { prisma } from "@/utils/prisma";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "@prisma/client";

type SafeUser = Omit<User, "password">;

class AuthController {
  /**
   * LOGIN USER
   * Receives { email, password } from Zod-validated login route
   */
  static async login(data: { email: string; password: string }): Promise<{
    message: string;
    user: SafeUser;
    token: string;
  }> {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

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
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = user;

    return {
      message: "Login successful",
      user: userWithoutPassword,
      token,
    };
  }

  // VERIFY TOKEN
  static verifyToken(token: string): JwtPayload & { id: string } {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & {
      id: string;
    };
  }

  //ONLY ADMIN
  static async restrictToAdmin(token: string) {
    const userId = this.getUserIdFromToken(token);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Forbidden");
    }
  }

  // GET USER ID FROM TOKEN
  static getUserIdFromToken(token: string): string {
    if (!token) {
      throw new Error("Unautorized!");
    }

    const payload = this.verifyToken(token);
    if (!payload.id) {
      throw new Error("Invalid token!");
    }

    return payload.id;
  }
}

export default AuthController;
