import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, CreditCard, User, MapPin } from "lucide-react";

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
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
              <p className="text-2xl font-bold">12</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Package className="h-8 w-8 text-black" />
            <div>
              <p className="text-sm text-gray-500">Pending Orders</p>
              <p className="text-2xl font-bold">2</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <CreditCard className="h-8 w-8 text-black" />
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold">₦245,000</p>
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
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Recent Orders</h2>
                <Button variant="outline">View all</Button>
              </div>

              <div className="space-y-4">
                {[1, 2, 3].map((order) => (
                  <div
                    key={order}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">Order #UT-10{order}</p>
                      <p className="text-sm text-gray-500">
                        2 items • Processing
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₦45,000</p>
                      <Button size="sm" className="mt-1">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
              <p className="text-sm text-gray-600">12 Allen Avenue, Ikeja</p>
              <p className="text-sm text-gray-600">Lagos, Nigeria</p>
              <Button className="mt-4 w-full" variant="outline">
                Manage Address
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
