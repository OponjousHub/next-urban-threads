"use client";

import { useState } from "react";
// import "@/app/globals.css";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to subscribe");
        return;
      }

      setMessage(data.message || "Subscribed successfully!");
      setEmail("");
      setEmail("");
    } catch (err) {
      setMessage("❌ Failed to subscribe. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="px-6 md:px-16 py-16 text-center bg-[var(--color-primary)] text-white">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay in the Loop</h2>

      <p className="text-lg md:text-xl opacity-90">
        Get the latest updates on new arrivals and exclusive offers.
      </p>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10 max-w-xl mx-auto"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full sm:flex-1 px-4 py-3 rounded-lg text-black outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-white text-[var(--color-primary)] font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
        <p className="text-sm mt-4 text-gray-200">
          Already subscribed?{" "}
          <a href="/unsubscribe" className="underline">
            Unsubscribe here
          </a>
        </p>
      </form>

      {/* Feedback */}
      {message && <p className="mt-6 text-sm font-medium">{message}</p>}
    </section>
  );
}

export default Newsletter;
