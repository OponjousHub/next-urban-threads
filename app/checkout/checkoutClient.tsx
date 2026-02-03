"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/store/cart-context";
import { AdminToast } from "@/components/ui/adminToast";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type ShippingAddress = {
  id: string;
  fullName: string | null;
  street: string;
  city: string;
  state?: string | null;
  country: string;
  phone?: string | null;
  isDefault: boolean;
};

export default function CheckoutClient({
  addresses: initialAddresses,
}: {
  addresses: ShippingAddress[];
}) {
  const [addresses, setAddresses] =
    useState<ShippingAddress[]>(initialAddresses);
  const { cartItems, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );

  const router = useRouter();

  // SELECT DEFAULT ADDRESS

  // Form data
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    street: "",
    city: "",
    postalCode: "",
    phone: "",
    state: "",
    country: "",
    paymentMethod: "credit-card",
  });

  useEffect(() => {
    const defaultAddress = addresses.find((a) => a.isDefault);
    if (defaultAddress) setSelectedAddressId(defaultAddress.id);
  }, [addresses]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal + shipping;

  const validateEmail = (email: string) => {
    if (!email.trim()) return "Email is required";
    if (!email.includes("@")) return "Enter a valid email address";
    return null;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "email") {
      const error = validateEmail(value);
      setErrors((prev) => ({
        ...prev,
        email: error || undefined,
      }));
    }
  };

  const orderItems = cartItems.map((item) => ({
    productId: String(item.id), // must match Product.id in DB
    quantity: item.quantity,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(formData.email);

    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    if (cartItems.length === 0) {
      router.push("/cart");
      return;
    }

    // 🔄 Loading toast
    const toastId = toast.loading("Placing your order...");
    setIsLoading(true);

    try {
      const address = {
        fullName: formData.fullName,
        street: formData.street,
        postalCode: formData.postalCode,
        state: formData.state,
        city: formData.city,
        country: formData.country,
        phone: formData.phone,
      };
      // console.log(address)

      console.log("SHOW SAVED EMAIL", {
        items: orderItems,
        shippingAddress: selectedAddressId ? null : address,
        addressId: selectedAddressId,
        paymentMethod: formData.paymentMethod,
        email: formData.email,
      });

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          shippingAddress: selectedAddressId ? null : address,
          addressId: selectedAddressId,
          paymentMethod: formData.paymentMethod,
          email: formData.email,
          saveAddress,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Order failed");
      }

      // //SHOW TOAST NOTIFICATION
      toast.dismiss(toastId);
      toast.loading("Redirecting to secure payment...");

      const data = await res.json();

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error("Payment URL missing");
      }

      clearCart();
      // router.push(`/orders/${order.id}`);
    } catch (err: any) {
      console.error(err);

      toast.dismiss(toastId);
      toast.custom(
        <AdminToast
          type="error"
          title="Order failed"
          description={err.message || "Something went wrong"}
        />,
        {
          duration: 6000, // ⏱️ 8 seconds
        },
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* BILLING DETAILS */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Checkout</h1>

        <form noValidate onSubmit={handleSubmit} className="space-y-6">
          {/* ================= SHIPPING ADDRESS ================= */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Shipping Address</h3>

            {addresses.length === 0 && (
              <div className="rounded-md border p-4 text-sm text-gray-500">
                No address found. Please add one in your dashboard.
              </div>
            )}

            {addresses.length > 0 && (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`flex gap-3 rounded-lg border p-4 cursor-pointer ${
                      selectedAddressId === address.id
                        ? "border-indigo-600 bg-indigo-50"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingAddress"
                      checked={selectedAddressId === address.id}
                      onChange={() => {
                        setFormData({
                          fullName: "",
                          email: "",
                          street: "",
                          city: "",
                          postalCode: "",
                          phone: "",
                          state: "",
                          country: "",
                          paymentMethod: "credit-card",
                        });
                        setSelectedAddressId(address.id);
                        setShowNewAddressForm(false);
                      }}
                    />

                    <div>
                      <p className="font-medium">{address.fullName}</p>
                      <p className="text-sm text-gray-600">{address.street}</p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state && `${address.state},`}{" "}
                        {address.country}
                      </p>
                      <p className="text-sm text-gray-600">{address.phone}</p>

                      {address.isDefault && (
                        <span className="mt-2 inline-block text-sm font-bold text-green-600 ">
                          Default
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
            {!showNewAddressForm && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address{" "}
                  <span className="text-red-500 mt-1 text-lg">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2
        ${
          errors.email
            ? "border-red-500 focus:ring-red-500"
            : "focus:ring-indigo-500"
        }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setSelectedAddressId(null);
                showNewAddressForm === false
                  ? setShowNewAddressForm(true)
                  : setShowNewAddressForm(false);
              }}
              className="text-indigo-600 text-sm"
            >
              + Add new address
            </button>
          </div>

          {showNewAddressForm && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="mb-4 w-full border rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mb-4 w-full border rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              {/* ✅ Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+234 801 234 5678"
                  className="mb-4 w-full border rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  required
                  className="mb-4 w-full border rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* ✅ State (optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Lagos"
                    className="w-full border rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>{" "}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="credit-card">Credit Card</option>
              <option value="paypal">PayPal</option>
              <option value="bank-transfer">Bank Transfer</option>
            </select>
          </div>
          {!selectedAddressId && (
            <label className="flex items-center gap-2 mt-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              Save this address for future checkouts
            </label>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition"
          >
            Place Order
          </button>
        </form>
      </div>

      {/* ORDER SUMMARY */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Order Summary
        </h2>

        <div className="space-y-3 text-gray-700">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center border-b border-gray-100 pb-2"
            >
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          <div className="flex justify-between mt-3">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>${shipping.toFixed(2)}</span>
          </div>

          <hr className="my-3" />

          <div className="flex justify-between font-semibold text-gray-900 text-lg">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
