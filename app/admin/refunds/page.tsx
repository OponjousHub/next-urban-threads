import { redirect } from "next/navigation";
import { getAuthPayload } from "@/lib/server/auth";
import { prisma } from "@/utils/prisma";
import RefundsPageUI from "./refundsUI";

export default async function RefundsPage() {
  const { userId, role } = await getAuthPayload();

  if (!userId) {
    redirect("/login");
  }

  if (role !== "ADMIN" && role !== "OWNER") {
    redirect("/");
  }

  const admin = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      name: true,
      email: true,
      avatarUrl: true,
    },
  });

  if (!admin) {
    redirect("/login");
  }
  return <RefundsPageUI admin={admin} />;
}
