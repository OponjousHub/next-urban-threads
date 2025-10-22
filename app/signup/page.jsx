"use client";

import { useState } from "react";
import Link from "next/link";
import { FiUser, FiMail, FiLock } from "react-icons/fi";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  //   const [error, setError] = useState("");

  //   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     setForm({ ...form, [e.target.name]: e.target.value });
  //   };

  //   const handleSubmit = (e: React.FormEvent) => {
  //     e.preventDefault();

  //     if (!form.name || !form.email || !form.password || !form.confirmPassword) {
  //       setError("All fields are required");
  //       return;
  //     }

  //     if (form.password !== form.confirmPassword) {
  //       setError("Passwords do not match");
  //       return;
  //     }

  //     setError("");
  //     console.log("Signing up:", form);
  //     // TODO: send signup data to your backend or API
  //   };

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

        {/* Error Message */}
        {/* {error && (
          <p className="bg-red-100 text-red-600 p-2 rounded-md text-center mb-4 text-sm">
            {error}
          </p>
        )} */}

        {/* Signup Form */}
        <form
          /*onSubmit={handleSubmit}*/ className="space-y-5"
          autoComplete="off"
        >
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
                value={form.name}
                // onChange={handleChange}
                autoComplete="new-name"
              />
            </div>
          </div>

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
                value={form.email}
                // onChange={handleChange}
                autoComplete="new-email"
              />
            </div>
          </div>

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
                value={form.password}
                // onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
          </div>

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
                value={form.confirmPassword}
                // onChange={handleChange}
                autoComplete="new-password"
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
