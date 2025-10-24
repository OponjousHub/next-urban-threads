"use client";

import { useState } from "react";
import { FiMail } from "react-icons/fi";

export default function NewsletterPage() {
  const [email, setEmail] = useState("");
  //   const [status, setStatus] =
  //     (useState < "idle") | "success" | ("error" > "idle");

  //   const handleSubmit = (e: React.FormEvent) => {
  //     e.preventDefault();

  //     if (!email || !email.includes("@")) {
  //       setStatus("error");
  //       return;
  //     }

  //     // Mock API call for demo
  //     setTimeout(() => {
  //       console.log("Subscribed:", email);
  //       setStatus("success");
  //       setEmail("");
  //     }, 1000);
  //   };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-10 pt-0 text-center">
        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Subscribe to Our Newsletter
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Stay updated with exclusive deals, product drops, and the latest
          trends in fashion and lifestyle.
        </p>

        {/* Subscription Form */}
        <form
          //   onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-center gap-4 justify-center"
        >
          <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 w-full sm:w-2/3 bg-gray-50">
            <FiMail className="text-gray-400 mr-2" />
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              //   onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-700"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition w-full sm:w-auto"
          >
            Subscribe
          </button>
        </form>

        {/* Status Message */}
        {status === "success" && (
          <p className="mt-6 text-green-600 font-medium">
            🎉 You’ve successfully subscribed!
          </p>
        )}
        {status === "error" && (
          <p className="mt-6 text-red-600 font-medium">
            ⚠️ Please enter a valid email address.
          </p>
        )}

        {/* Footer Info */}
        <p className="text-gray-500 text-sm mt-10 max-w-md mx-auto">
          By subscribing, you agree to receive marketing emails from our store.
          You can unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
