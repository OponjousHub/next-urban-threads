"use client";

import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";

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
              <a href="#" className="hover:text-white transition-colors">
                Men
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Women
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Kids
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Accessories
              </a>
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
              <a href="#" className="hover:text-white transition-colors">
                Contact Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Shipping & Returns
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                FAQs
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter + Social */}
        <div>
          <h3 className="text-white font-semibold text-2xl mb-4">
            Stay Updated
          </h3>
          <p className="text-md mb-4">
            Subscribe to get the latest deals and updates straight to your
            inbox.
          </p>
          <form className="flex">
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-3 py-2 rounded-l-md focus:outline-none text-white"
            />
            <button
              type="submit"
              className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-r-md hover:bg-[var(--color-primary)] transition-colors"
            >
              Subscribe
            </button>
          </form>

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
        © {new Date().getFullYear()} ShopMate. All rights reserved.
      </div>
    </footer>
  );
}
