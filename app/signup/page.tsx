"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Country, State } from "country-state-city";
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiHome,
} from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { appToast } from "@/utils/appToast";

const initialState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  city: "",
  country: "",
  address: "",
  state: "",
  postalCode: "",
};

export default function SignupPage() {
  const [form, setForm] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);

  const countries = Country.getAllCountries();
  const states = State.getStatesOfCountry(form.country);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ---------------------------------------------------------
    // Validation
    // ---------------------------------------------------------

    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.city ||
      !form.country ||
      !form.address ||
      !form.phone ||
      !form.confirmPassword
    ) {
      appToast.warning(
        "Some fields are required",
        "Please fill in all the required fields.",
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      appToast.warning(
        "Passwords do not match",
        "Password and password confirm must match.",
      );
      return;
    }

    // ---------------------------------------------------------
    // Start loading
    // ---------------------------------------------------------

    setIsLoading(true);

    const toastId = toast.loading("Creating your account...");

    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          city: form.city,
          country: form.country,
          street: form.address,
          address: `${form.address}, ${form.city}, ${form.state ?? null}, ${form.country}`,
          state: form.state,
          postalCode: form.postalCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      toast.dismiss(toastId);

      appToast.success(
        "Signup successful",
        `${data?.name ?? form.name}, your registration was successful.`,
      );

      setForm(initialState);

      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("SIGN UP ERROR:", err);

      toast.dismiss(toastId);

      appToast.error("Signup failed!", err.message || "Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)] sm:p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Create Your Account
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Join us and start shopping today
            </p>
          </div>

          {/* Signup Form */}
          <form
            className="space-y-5"
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            {/* Full Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Full Name
              </label>

              <div className="flex items-center rounded-xl border border-gray-300 bg-white px-3.5 py-3 transition-all duration-200 focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/10">
                <FiUser className="mr-3 shrink-0 text-gray-400" />

                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email Address
              </label>

              <div className="flex items-center rounded-xl border border-gray-300 bg-white px-3.5 py-3 transition-all duration-200 focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/10">
                <FiMail className="mr-3 shrink-0 text-gray-400" />

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Phone Number
              </label>

              <div className="flex items-center rounded-xl border border-gray-300 bg-white px-3.5 py-3 transition-all duration-200 focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/10">
                <FiPhone className="mr-3 shrink-0 text-gray-400" />

                <input
                  type="tel"
                  name="phone"
                  placeholder="08063702221"
                  className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Street Address
              </label>

              <div className="flex items-center rounded-xl border border-gray-300 bg-white px-3.5 py-3 transition-all duration-200 focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/10">
                <FiHome className="mr-3 shrink-0 text-gray-400" />

                <input
                  type="text"
                  name="address"
                  placeholder="No 43, Orga Wuse Street, Wuse"
                  className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                  autoComplete="street-address"
                  value={form.address}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                City
              </label>

              <div className="flex items-center rounded-xl border border-gray-300 bg-white px-3.5 py-3 transition-all duration-200 focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/10">
                <FiMapPin className="mr-3 shrink-0 text-gray-400" />

                <input
                  type="text"
                  name="city"
                  placeholder="Abuja"
                  className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* State */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                State
              </label>

              <div className="flex items-center rounded-xl border border-gray-300 bg-white px-3.5 py-3 transition-all duration-200 focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/10">
                <FiMapPin className="mr-3 shrink-0 text-gray-400" />

                <select
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  disabled={!form.country || isLoading}
                  className="w-full bg-transparent text-sm text-gray-700 outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
                  autoComplete="address-level1"
                >
                  <option value="">
                    {form.country ? "Select State" : "Select Country First"}
                  </option>

                  {states.map((state) => (
                    <option key={state.isoCode} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Country
              </label>

              <div className="flex items-center rounded-xl border border-gray-300 bg-white px-3.5 py-3 transition-all duration-200 focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/10">
                <FiGlobe className="mr-3 shrink-0 text-gray-400" />

                <select
                  name="country"
                  value={form.country}
                  onChange={(e) => {
                    handleChange(e);

                    setForm((prev) => ({
                      ...prev,
                      state: "",
                    }));
                  }}
                  disabled={isLoading}
                  className="w-full bg-transparent text-sm text-gray-700 outline-none disabled:cursor-not-allowed"
                  autoComplete="country"
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

            {/* Postal Code */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Postal Code
              </label>

              <div className="flex items-center rounded-xl border border-gray-300 bg-white px-3.5 py-3 transition-all duration-200 focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/10">
                <FiGlobe className="mr-3 shrink-0 text-gray-400" />

                <input
                  type="text"
                  name="postalCode"
                  placeholder="Postal code"
                  className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                  autoComplete="postal-code"
                  value={form.postalCode}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>

              <div className="flex items-center rounded-xl border border-gray-300 bg-white px-3.5 py-3 transition-all duration-200 focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/10">
                <FiLock className="mr-3 shrink-0 text-gray-400" />

                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Confirm Password
              </label>

              <div className="flex items-center rounded-xl border border-gray-300 bg-white px-3.5 py-3 transition-all duration-200 focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/10">
                <FiLock className="mr-3 shrink-0 text-gray-400" />

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] py-3.5 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[var(--color-primary-dark)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-7 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[var(--color-primary)] transition-colors hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
