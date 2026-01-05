"use client";

import { useState } from "react";
import { AdminToast } from "@/components/ui/adminToast";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiHome,
} from "react-icons/fi";
import { initialize } from "next/dist/server/lib/render-server";

const initialState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  city: "",
  country: "",
  address: "",
};
export default function SignupPage() {
  const [form, setForm] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔄 Loading toast
    const toastId = toast.loading("Signing up user...");
    setIsLoading(true);

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
      toast.dismiss(toastId);
      toast.custom(
        <AdminToast
          type="error"
          title="All fields are required"
          description="Please fill in all the fields."
        />,
        {
          duration: 6000, // ⏱️ 8 seconds
        }
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      // setError("Passwords do not match");
      toast.dismiss(toastId);
      toast.custom(
        <AdminToast
          type="error"
          title="Passwords do not match"
          description="Password and password confirm must match."
        />,
        {
          duration: 6000, // ⏱️ 8 seconds
        }
      );
      return;
    }

    console.log("Signing up:", form);

    try {
      // TODO: send signup data to your backend or API
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          city: form.city,
          country: form.country,
          address: form.address,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.log(data);
        throw new Error(data.message || "Signup failed");
      }

      // const data = await response.json();
      console.log(data.user);
      toast.dismiss(toastId);
      toast.custom(
        <AdminToast
          title="Signup sucessfull"
          description={`${data.user.name} your registration was successful.`}
        />,
        {
          duration: 6000, // ⏱️ 8 seconds
        }
      );
      setForm(initialState);
    } catch (err: any) {
      console.error("SIGN UP ERROR:", err);

      toast.dismiss(toastId);
      toast.custom(
        <AdminToast
          type="error"
          title="Signup failed!"
          description={err.message || "Please try again."}
        />,
        {
          duration: 6000, // ⏱️ 8 seconds
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Create Your Account
        </h1>
        <p className="text-gray-500 text-center mb-8">
          Join us and start shopping today
        </p>

        {/* Signup Form */}
        <form className="space-y-5" autoComplete="off" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Full Name
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <FiUser className="text-gray-400 mr-2" />
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                className="w-full outline-none text-gray-700"
                autoComplete="new-name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email Address
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <FiMail className="text-gray-400 mr-2" />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="w-full outline-none text-gray-700"
                autoComplete="new-email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Phone Number
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <FiPhone className="text-gray-400 mr-2" />
              <input
                type="tel"
                name="phone"
                placeholder="08063702221"
                className="w-full outline-none text-gray-700"
                autoComplete="new-tel"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">City</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <FiMapPin className="text-gray-400 mr-2" />
              <input
                type="text"
                name="city"
                placeholder="Abuja"
                className="w-full outline-none text-gray-700"
                autoComplete="new-city"
                value={form.city}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Country
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <FiGlobe className="text-gray-400 mr-2" />
              <input
                type="text"
                name="country"
                placeholder="Nigeria"
                className="w-full outline-none text-gray-700"
                autoComplete="new-country"
                value={form.country}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Address
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <FiHome className="text-gray-400 mr-2" />
              <input
                type="text"
                name="address"
                placeholder="N0 43, Orga Wuse Street, Wuse"
                className="w-full outline-none text-gray-700"
                autoComplete="new-address"
                value={form.address}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <FiLock className="text-gray-400 mr-2" />
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                className="w-full outline-none text-gray-700"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Confirm Password
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <FiLock className="text-gray-400 mr-2" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                className="w-full outline-none text-gray-700"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Create Account
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-indigo-600 font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
