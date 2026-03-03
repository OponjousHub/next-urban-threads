import "@/app/globals.css";
import { redirect } from "next/navigation";
import { getAuthPayload } from "@/lib/server/auth";

// import { cookies } from "next/headers";
// import AuthController from "@/modules/auth/auth.controller";
// import { getLoggedInUserId } from "@/lib/auth";
// import { error } from "console";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, role, tenant } = await getAuthPayload();

  if (!userId) {
    redirect("/login");
  }

  if (role !== "ADMIN" && role !== "OWNER") {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white p-6">
        <h2 className="text-xl font-bold mb-8">Admin Panel</h2>

        <nav className="space-y-4">
          <a href="/admin">Dashboard</a>
          <a href="/admin/products">Products</a>
          <a href="/admin/orders">Orders</a>
          <a href="/admin/reviews">Reviews</a>
          <a href="/admin/users">Users</a>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 bg-gray-50">{children}</main>
    </div>
  );
}

// export default async function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   // const cookieStore = await cookies();
//   // const token = cookieStore.get("token")?.value;
//   // console.log(token);
//   // if (!token) redirect("/login");

//   const userId = await getLoggedInUserId();
//   if (!userId) redirect("/login");

//   // Get the user
//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     select: { id: true, role: true },
//   });
//   if (!user || user.role !== "ADMIN") {
//     redirect("/");
//   }

//   return <div className="min-h-screen bg-gray-50">{children}</div>;
// }
