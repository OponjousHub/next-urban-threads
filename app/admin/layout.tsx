import { cookies } from "next/headers";
import "@/app/globals.css";
import { redirect } from "next/navigation";
import { prisma } from "@/utils/prisma";
import AuthController from "@/modules/auth/auth.controller";
import { getLoggedInUserId } from "@/lib/auth";
import { error } from "console";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const cookieStore = await cookies();
  // const token = cookieStore.get("token")?.value;
  // console.log(token);
  // if (!token) redirect("/login");

  const userId = await getLoggedInUserId();
  if (!userId) redirect("/login");

  // Get the user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
