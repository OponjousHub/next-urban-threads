"use client";

import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";

// import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {/* Company Info */}
        <div>
          <h2 className="text-white text-2xl font-semibold mb-4">
            Urban Threads
          </h2>
          <p className="text-md leading-relaxed">
            Your one-stop shop for quality products at the best prices. We make
            online shopping easy, secure, and enjoyable.
          </p>
        </div>

        {/* Shop Links */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-4">Shop</h3>
          <ul className="space-y-2 text-md">
            <li>
              <Link
                href="/products/men"
                className="hover:text-white transition-colors"
              >
                Men
              </Link>
            </li>
            <li>
              <Link
                href="/products/women"
                className="hover:text-white transition-colors"
              >
                Women
              </Link>
            </li>
            <li>
              <Link
                href="/products/kids"
                className="hover:text-white transition-colors"
              >
                Kids
              </Link>
            </li>
            <li>
              <Link
                href="/products/accessories"
                className="hover:text-white transition-colors"
              >
                Accessories
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-white font-semibold text-2xl mb-4">
            Customer Support
          </h3>
          <ul className="space-y-2 text-md">
            <li>
              <Link
                href="/contact"
                className="hover:text-white transition-colors"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                href="/shipping"
                className="hover:text-white transition-colors"
              >
                Shipping & Returns
              </Link>
            </li>
            <li>
              <Link href="/faqs" className="hover:text-white transition-colors">
                FAQs
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter + Social */}
        <div>
          <h3 className="text-white font-semibold text-2xl mb-4">
            Stay Updated
          </h3>
          <p className="text-md mb-4">
            Get exclusive deals, new arrivals, and style inspiration.
          </p>

          {/* ✅ Newsletter Link (replaces form) */}
          <Link
            href="/newsletter"
            className="inline-block bg-[var(--color-primary)] text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium"
          >
            Join Our Newsletter
          </Link>

          {/* Social Links */}
          <div className="flex space-x-4 mt-5">
            <a href="#" className="hover:text-white">
              <FaFacebookF />
            </a>
            <a href="#" className="hover:text-white">
              <FaInstagram />
            </a>
            <a href="#" className="hover:text-white">
              <FaTwitter />
            </a>
            <a href="#" className="hover:text-white">
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Urban Threads. All rights reserved.
      </div>
    </footer>
  );
}
