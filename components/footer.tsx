"use client";

import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaTiktok,
} from "react-icons/fa";
import { useTenant } from "@/store/tenant-provider-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
};

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { tenant } = useTenant();
  const router = useRouter();

  const brandName = tenant?.name || "Your Store";

  /* ---------------- Fetch Categories ---------------- */
  useEffect(() => {
    async function loadCategories() {
      try {
        // setLoadingCategories(true);
        const res = await fetch("/api/admin/category");
        const data = await res.json();
        setCategories(data || []);
      } catch (err) {
        console.error("Failed to load categories");
      } finally {
        // setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

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
    <footer className="bg-gray-950 text-gray-300 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* TOP GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 pb-12 border-b border-gray-800">
          {/* BRAND */}
          <div>
            <h2 className="text-white text-xl font-semibold mb-4">
              {brandName}
            </h2>
            <p className="text-sm leading-relaxed text-gray-400">
              Premium shopping experience with curated products, fast delivery,
              and secure checkout. Built for modern commerce.
            </p>

            {/* SOCIAL */}
            <div className="flex gap-4 mt-5">
              <a href="#" className="hover:text-white transition">
                <FaFacebookF />
              </a>
              <a href="#" className="hover:text-white transition">
                <FaInstagram />
              </a>
              <a href="#" className="hover:text-white transition">
                <FaTwitter />
              </a>
              <a href="#" className="hover:text-white transition">
                <FaLinkedinIn />
              </a>
              <a href="#" className="hover:text-white transition">
                <FaTiktok />
              </a>
            </div>
          </div>

          {/* SHOP */}
          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className=" text-sm flex flex-col justify-self-start">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => router.push(`/products?category=${cat.slug}`)}
                  className={`py-1 rounded-full font-medium transition text-left`}
                >
                  {cat.name}
                </button>
              ))}
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>

            <ul className="space-y-3 text-sm">
              {[
                { label: "Contact Us", href: "/contact", icon: "📩" },
                { label: "Shipping", href: "/shipping", icon: "🚚" },
                { label: "Returns", href: "/return-policy  ", icon: "🚚" },
                { label: "FAQs", href: "/faqs", icon: "❓" },
                { label: "Track Order", href: "/track-order", icon: "📦" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 hover:text-white transition"
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COMPANY / LEGAL */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: "About Us", href: "/about" },
                { label: "Careers", href: "/careers" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* MIDDLE: NEWSLETTER + TRUST */}
        <div className="py-10 grid md:grid-cols-2 gap-10 items-center">
          {/* NEWSLETTER */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-2">
              Stay in the loop
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Get updates on new arrivals, offers, and exclusive deals.
            </p>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-md bg-gray-900 border border-gray-800 focus:outline-none focus:border-white text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-white text-black rounded-md text-sm font-medium hover:bg-gray-200 transition"
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
            {message && <p className="mt-6 text-sm font-medium">{message}</p>}
          </div>

          {/* TRUST / PAYMENT */}
          <div className="text-sm text-gray-400 md:text-right">
            <p className="mb-2 text-white font-medium">Secure checkout</p>
            <p>We accept major payment methods</p>

            <div className="flex md:justify-end gap-3 mt-3 text-xs text-gray-500">
              <span>Visa</span>
              <span>Mastercard</span>
              <span>PayPal</span>
              <span>Apple Pay</span>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-3">
          <p>
            © {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>

          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-white">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
