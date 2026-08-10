import { ProductForm } from "@/components/products/productForm";
import { getAuthPayload } from "@/lib/server/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/utils/prisma";

export default async function NewProductPage() {
  const { userId, role } = await getAuthPayload();

  if (!userId) {
    redirect("/login");
  }

  if (role !== "ADMIN" && role !== "OWNER") {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      name: true,
      email: true,
      avatarUrl: true,
    },
  });

  const admin = {
    name: user?.name,
    email: user?.email,
    avatarUrl: user?.avatarUrl,
  };
  return <ProductForm basePath="/admin/products" admin={admin} />;
}
