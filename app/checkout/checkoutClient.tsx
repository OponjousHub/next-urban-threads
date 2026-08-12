"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/store/cart-context";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { appToast } from "@/utils/appToast";
import { useTenant } from "@/store/tenant-provider-context";
import { Country, State } from "country-state-city";
import { normalizeCountryCode } from "@/utils/normalizeCountryCode";
import { formatCurrency } from "@/lib/formatCurrency";

type ShippingAddress = {
  id: string;
  fullName: string | null;
  street: string;
  city: string;
  state?: string | null;
  country: string;
  phone?: string | null;
  isDefault: boolean;
  // postalCode: string;
};

type CheckoutItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantColor?: string;
  variantSize?: string;
  productId: string;
  variantId?: string;
};

export default function CheckoutClient({
  addresses: initialAddresses,
}: {
  addresses: ShippingAddress[];
}) {
  const [addresses, setAddresses] =
    useState<ShippingAddress[]>(initialAddresses);
  const { cartItems, clearCart, coupon, discountAmount } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );

  // Calculate Shipping Address Helper
  const calculateShipping = async (address: {
    country: string;
    state: string;
    city: string;
  }) => {
    // Immediately invalidate the previous shipping selection.
    setShippingMethods([]);
    setSelectedShipping(null);
    setShippingLoading(true);

    try {
      const res = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country: address.country,
          state: address.state,
          city: address.city,

          items: checkoutItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);

        console.log("Shipping calculation failed:", error);

        setShippingMethods([]);
        setSelectedShipping(null);
        return;
      }

      const methods = await res.json();

      setShippingMethods(methods);

      if (methods.length > 0) {
        setSelectedShipping(methods[0]);
      } else {
        setSelectedShipping(null);
      }
    } catch (error) {
      console.error("Shipping calculation error:", error);

      setShippingMethods([]);
      setSelectedShipping(null);
    } finally {
      setShippingLoading(false);
    }
  };

  // Recalculate shipping whenever a saved address is selected
  useEffect(() => {
    if (!selectedAddressId) return;

    const address = addresses.find((a) => a.id === selectedAddressId);

    if (!address) return;

    if (!address.country || !address.state) return;

    calculateShipping({
      country: normalizeCountryCode(address.country),
      state: address.state,
      city: address.city ?? "",
    });
  }, [selectedAddressId, addresses]);

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

  // const currentAddress: ShippingAddress = {
  //   id: "",
  //   fullName: formData.fullName,
  //   street: formData.street,
  //   city: formData.city,
  //   state: formData.state,
  //   country: formData.country,
  //   phone: formData.phone,
  //   isDefault: false,
  // };

  // Recalculate shipping whenever address is selected
  useEffect(() => {
    // Existing saved address selected
    if (selectedAddressId) return;

    // New address is incomplete
    if (!formData.country || !formData.state) {
      setShippingMethods([]);
      setSelectedShipping(null);
      setShippingLoading(false);
      return;
    }

    calculateShipping({
      country: formData.country,
      state: formData.state,
      city: formData.city,
    });
  }, [selectedAddressId, formData.country, formData.state, formData.city]);

  // Calculating  the shipping when user enters new address
  useEffect(() => {
    // Only for the "new address" form
    if (selectedAddressId) return;

    // Don't calculate until both are selected
    if (!formData.country || !formData.state) return;

    calculateShipping({
      country: formData.country,
      state: formData.state,
      city: formData.city,
    });
  }, [selectedAddressId, formData.country, formData.state]);

  const countries = Country.getAllCountries();
  const states = State.getStatesOfCountry(formData.country);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenant } = useTenant();
  const mode = searchParams.get("mode");

  const buyNowItems: CheckoutItem[] =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("buyNow") || "[]")
      : [];

  const checkoutItems: CheckoutItem[] =
    mode === "buy-now" ? buyNowItems : cartItems;

  useEffect(() => {
    const defaultAddress = addresses.find((a) => a.isDefault);
    if (defaultAddress) setSelectedAddressId(defaultAddress.id);
  }, [addresses]);

  const subtotal = checkoutItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const shipping = Number(selectedShipping?.amount ?? 0);
  const discount = Number(discountAmount ?? 0);

  const discountedSubtotal = Math.max(0, subtotal - discount);

  const total = discountedSubtotal + shipping;

  //checkout validity variable
  const shippingAvailable =
    !shippingLoading && shippingMethods.length > 0 && selectedShipping !== null;

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

  const orderItems = checkoutItems.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    quantity: item.quantity,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(formData.email);

    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    if (checkoutItems.length === 0) {
      router.push("/cart");
      return;
    }

    if (!shippingAvailable) {
      appToast.error(
        "Shipping unavailable",
        "Please choose an address with an available shipping option.",
      );
      return;
    }

    appToast.loading("Placing your order...");
    setIsLoading(true);

    try {
      const address = {
        fullName: formData.fullName,
        email: formData.email,
        street: formData.street,
        postalCode: formData.postalCode,
        state: formData.state,
        city: formData.city,
        country: formData.country,
        phone: formData.phone,
      };

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
          couponId: coupon?.id ?? null,
          shippingMethodId: selectedShipping?.methodId,
          shippingCost: selectedShipping?.price,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Order failed");
      }

      // //SHOW TOAST NOTIFICATION
      appToast.dismiss();
      appToast.loading("Redirecting to secure payment...");

      const data = await res.json();

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error("Payment URL missing");
      }

      clearCart();
    } catch (err: any) {
      console.error(err);

      appToast.error(
        "Order failed",
        `${err.message || "Something went wrong"}`,
      );
    } finally {
      setIsLoading(false);
      appToast.dismiss();
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
                    className={`flex gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                      selectedAddressId === address.id
                        ? "border-[var(--color-primary)] bg-indigo-50 shadow-sm"
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
            : "focus:ring-[var(--color-primary-ring)]"
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
              className="text-[var(--color-primary)] text-sm"
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
                    className="mb-4 w-full border rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
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
                    className="mb-4 w-full border rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
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
                  className="mb-4 w-full border rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
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
                  className="mb-4 w-full border rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="w-full border rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
                  />
                </div>

                {/* ✅ State (optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    disabled={!formData.country}
                    className="w-full border rounded-lg px-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {formData.country
                        ? "Select State"
                        : "Select Country First"}
                    </option>

                    {states.map((state) => (
                      <option key={state.isoCode} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="w-full border rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={(e) => {
                      handleChange(e);

                      // Reset state whenever country changes
                      setFormData((prev) => ({
                        ...prev,
                        state: "",
                      }));

                      setShippingMethods([]);
                      setSelectedShipping(null);
                    }}
                    required
                    className="w-full border rounded-lg px-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)]"
                  >
                    <option value="">Select Country</option>

                    {countries.map((country) => (
                      <option key={country.isoCode} value={country.isoCode}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/*============ Customer choose Shipping*/}
          <div className="space-y-3">
            <div className="space-y-3">
              <h3 className="font-semibold">Shipping Method</h3>

              {shippingLoading ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 flex items-center gap-3">
                  <span className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-[var(--color-primary)] animate-spin" />
                  Checking shipping availability...
                </div>
              ) : shippingMethods.length === 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <p className="font-medium">
                    Shipping is unavailable for this address.
                  </p>

                  <p className="mt-1">
                    Please choose another address or enter a different shipping
                    location.
                  </p>
                </div>
              ) : (
                shippingMethods.map((method) => (
                  <label
                    key={method.rateId}
                    className="flex justify-between border rounded-xl p-4 cursor-pointer"
                  >
                    <input
                      type="radio"
                      checked={selectedShipping?.methodId === method.methodId}
                      onChange={() => setSelectedShipping(method)}
                    />

                    <div>
                      <p>{method.method}</p>

                      <p className="text-sm text-gray-500">{method.estimate}</p>
                    </div>

                    <span>
                      {formatCurrency(method.amount, tenant.currency)}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={formData.paymentMethod === "online"}
                  onChange={handleChange}
                  className="h-4 w-4 text-[var(--color-primary)]"
                />

                <div>
                  <p className="font-medium text-gray-900">
                    Card / Online Payment
                  </p>
                  <p className="text-sm text-gray-500">
                    Secure payment through our payment provider
                  </p>
                </div>
              </label>
            </div>
          </div>

          {!selectedAddressId && (
            <label className="flex items-center gap-2 mt-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="h-4 w-4 text-[var(--color-primary)] border-gray-300 rounded focus:ring-[var(--color-primary-ring)] bg-[var(--color-primary)]"
              />
              Save this address for future checkouts
            </label>
          )}

          <button
            type="submit"
            disabled={isLoading || shippingLoading || !shippingAvailable}
            className={`w-full font-medium py-3 rounded-xl transition ${
              isLoading || shippingLoading || !shippingAvailable
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
            }`}
          >
            {isLoading
              ? "Processing..."
              : shippingLoading
                ? "Checking shipping..."
                : !shippingAvailable
                  ? "Shipping unavailable"
                  : "Place Order"}
          </button>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
            <span>🔒 Secure Checkout</span>
            <span>💳 Encrypted Payment</span>
            <span>🚚 Fast Delivery</span>
          </div>
        </form>
      </div>

      {/* ORDER SUMMARY */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit sticky top-24">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Order Summary
        </h2>

        <div className="space-y-3 text-gray-700">
          {checkoutItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border bg-gray-50">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <p className="font-medium text-gray-800">{item.name}</p>

                  {(item.variantColor || item.variantSize) && (
                    <p className="text-sm text-gray-500">
                      {item.variantColor}{" "}
                      {item.variantSize && `• ${item.variantSize}`}
                    </p>
                  )}

                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>

              <p className="font-semibold text-gray-800">
                {formatCurrency(item.price * item.quantity, tenant.currency)}
              </p>
            </div>
          ))}

          <div className="flex justify-between mt-3">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal, tenant.currency)}</span>
          </div>

          {coupon && discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({coupon.code})</span>
              <span>- {formatCurrency(discount, tenant.currency)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{formatCurrency(shipping, tenant.currency)}</span>
          </div>

          <hr className="my-3" />

          <div className="flex justify-between font-semibold text-gray-900 text-lg">
            <span>Total</span>
            <span>{formatCurrency(total, tenant.currency)}</span>
          </div>
        </div>
        <div className="mt-6 space-y-2 text-sm text-gray-500 border-t pt-4">
          <p>🚚 Estimated delivery: 2–5 business days</p>
          <p>↩️ 7-day return policy</p>
          <p>🔒 Secure SSL encrypted checkout</p>
        </div>
      </div>
    </div>
  );
}
