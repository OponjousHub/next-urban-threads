import bcrypt from "bcryptjs";
import { prisma } from "@/utils/prisma";
import { RegisterInput, UpdateUserInput } from "./auth.schema";
import jwt, { JwtPayload } from "jsonwebtoken";

class AuthController {
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

  /**
   * LOGIN USER
   * Receives { email, password } from Zod-validated login route
   */
  static async login(data: { email: string; password: string }) {
    const { email, password } = data;
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return { error: "Invalid email or password" };
    }

    // Compare password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return { error: "Invalid email or password" };
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    // Remove password before sending response
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
      throw new Error("Fail to update user");
    }
  }
}

export default AuthController;
