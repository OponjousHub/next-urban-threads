import AdminHeaderUI from "./adminHeaderUI";
import { getLoggedInUserId } from "@/lib/auth";
import { prisma } from "@/utils/prisma";

type Props = {
  title: string;
  subtitle?: string;
};

export default async function AdminHeader({ title, subtitle }: Props) {
  const userId = await getLoggedInUserId();

  const admin = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          avatarUrl: true,
        },
      })
    : null;
  console.log("ADMIN TOPBAR", admin);

  return (
    <AdminHeaderUI
      title={title}
      subtitle={subtitle}
      admin={admin ?? undefined}
    />
  );
}
