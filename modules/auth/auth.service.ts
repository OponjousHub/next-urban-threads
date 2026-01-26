// src/modules/auth/auth.service.ts
import jwt from "jsonwebtoken";

export class AuthService {
  static generateToken(userId: string) {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  }
}
