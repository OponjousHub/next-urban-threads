"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, CreditCard, User, MapPin } from "lucide-react";
import { getUserDashboardStats } from "@/app/lib/dashboard";
import Link from "next/link";

type DashboardStats = Awaited<ReturnType<typeof getUserDashboardStats>>;
type ShippingAddress = {
  fullName: string;
  street: string;
  city: string;
  state?: string;
  country: string;
  phone?: string;
};

function DashboardClient({ stats }: { stats: DashboardStats }) {
  const shippingAddress = JSON.parse(stats.recentOrders[0].shippingAddress);

  function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  console.log(stats);
  // REMOVE CITY, STATE and COUNTRY FROM STREET ADDRESS
  function cleanStreetAddress(
    street: string,
    city?: string,
    state?: string,
    country?: string,
  ) {
    const parts = [city, state, country].filter(Boolean);

    if (parts.length === 0) return street;

    const regex = new RegExp(
      `,?\\s*(${parts.map((p) => escapeRegExp(p!)).join("|")})`,
      "gi",
    );

    return street
      .replace(regex, "")
      .replace(/\s*,\s*$/, "")
      .trim();
  }

  const streetAddress = cleanStreetAddress(
    shippingAddress.street,
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.country,
  );

  const previewItems = stats.recentOrders.slice(0, 2);
  const remaining = stats.recentOrders.length - previewItems.length;
  console.log(previewItems);

  return (
    <div className="min-h-screen bg-gray-50 p-6 mx-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-600">Welcome back to Urban Threads 👋</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <ShoppingBag className="h-8 w-8 text-black" />
            <div>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Package className="h-8 w-8 text-black" />
            <div>
              <p className="text-sm text-gray-500">Pending Orders</p>
              <p className="text-2xl font-bold">{stats.pendingOrders}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <CreditCard className="h-8 w-8 text-black" />
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold">${+stats.totalSpent}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <User className="h-8 w-8 text-black" />
            <div>
              <p className="text-sm text-gray-500">Account</p>
              <p className="text-2xl font-bold">Active</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Section */}
      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {stats.recentOrders.map((order) => {
              const previewItems = order.items.slice(0, 2);
              const remaining = order.items.length - previewItems.length;

              return (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Left section: images + order info */}
                  <div className="flex items-center gap-4">
                    {/* Product previews */}
                    <div className="flex items-center gap-2">
                      {previewItems.map((item: any) => {
                        console.log(item);
                        return (
                          <img
                            key={item.id}
                            src={item.product.images?.[0]}
                            alt={item.product.name}
                            className="h-12 w-12 rounded-md object-cover border"
                          />
                        );
                      })}
                    </div>

                    {/* Order info */}
                    <div>
                      <p className="font-medium">
                        {order.items[0]?.product?.name}
                        {order.items.length > 1 && (
                          <span className="text-gray-500">
                            {" "}
                            +{order.items.length - 1} more
                          </span>
                        )}
                      </p>

                      <p className="text-sm text-gray-500">
                        Order #{order.paymentReference}
                      </p>

                      <p className="text-sm text-gray-500">
                        {order.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0,
                        )}{" "}
                        items • {order.status}
                      </p>
                    </div>
                  </div>

                  {/* Right section: amount + action */}
                  <div className="flex items-center justify-between sm:flex-col sm:items-end">
                    <p className="font-semibold">
                      ${Number(order.totalAmount).toFixed(2)}
                    </p>
                    <Link href={`${`/dashboard/order/${order.id}`}`}>
                      <Button size="sm" className="mt-2">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Profile & Address */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Profile</h2>
              <p className="text-sm text-gray-600">Name: Joseph O.</p>
              <p className="text-sm text-gray-600">Email: user@email.com</p>
              <Button className="mt-4 w-full" variant="outline">
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Shipping Address</h2>
              </div>
              <p className="text-sm text-gray-600">{streetAddress}</p>
              <p className="text-sm text-gray-600">{`${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.country}`}</p>
              <Link href={"/dashboard/addresses"}>
                <Button className="mt-4 w-full" variant="outline">
                  Manage Address
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardClient;
