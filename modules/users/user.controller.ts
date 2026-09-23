import { RegisterInput } from "@/modules/users/user.schema";
import { UserService } from "./user.service";
import { CreateAdminInput } from "@/modules/users/admin.schema";

class UserController {
  static async createAdmin(data: CreateAdminInput) {
    return UserService.createAdmin(data);
  }

  static async register(data: RegisterInput) {
    const user = await UserService.register(data);
    return user;
  }

  static async getAllUsers() {
    return UserService.getAllUsers();
  }

  static async getMe(token: string) {
    return UserService.getMe(token);
  }

  static async updateUser(userId: string, data: any) {
    const user = await UserService.updateUser(userId, data);
    return { success: true, user };
  }

  static async deleteUserAccount(token: string) {
    return UserService.deleteAccount(token);
  }
}

export default UserController;
