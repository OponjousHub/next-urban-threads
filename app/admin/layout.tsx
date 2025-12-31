import { cookies } from "next/headers";
import "@/app/globals.css";
// import "@/app/tailwind-output.css";
import { redirect } from "next/navigation";
import AuthController from "@/modules/auth/auth.controller";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // if (!token) redirect("/login");

  // const user = AuthController.verifyToken(token);

  // if (!user || user.role !== "ADMIN") {
  //   redirect("/");
  // }

  // return <>{children}</>;

  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
