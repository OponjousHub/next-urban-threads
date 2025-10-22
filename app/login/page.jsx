"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMail, FiLock } from "react-icons/fi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false);

  //   const handleSubmit = (e: React.FormEvent) => {
  //     e.preventDefault();

  //     // Mock validation for demo purposes
  //     if (email === "" || password === "") {
  //       setShowError(true);
  //       return;
  //     }

  //     setShowError(false);
  //     console.log("Logging in with:", { email, password });
  //     // TODO: handle real authentication (API call)
  //   };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-500 text-center mb-8">
          Sign in to continue shopping
        </p>

        {/* Error message */}
        {showError && (
          <p className="bg-red-100 text-red-600 p-2 rounded-md text-center mb-4 text-sm">
            Please enter your email and password
          </p>
        )}

        {/* Login Form */}
        <form
          /*onSubmit={handleSubmit}*/ autoComplete="off"
          className="space-y-5"
        >
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email Address
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <FiMail className="text-gray-400 mr-2" />
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full outline-none text-gray-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="Enter your password"
                className="w-full outline-none text-gray-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-indigo-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <Link href={"/signup"}>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition"
            >
              Log In
            </button>
          </Link>
        </form>

        {/* Signup Link */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Don’t have an account?{" "}
          <Link
            href="/signup"
            className="text-indigo-600 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
