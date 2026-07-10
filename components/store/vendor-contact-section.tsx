"use client";

import { Mail, Phone, MessageCircle, ArrowRight } from "lucide-react";

type Props = {
  vendor: {
    name: string;
    email?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
  };
};

export default function VendorContactSection({ vendor }: Props) {
  const whatsappLink = vendor.whatsapp
    ? `https://wa.me/${vendor.whatsapp.replace(/\D/g, "")}`
    : null;

  return (
    <section className="mt-20">
      <div className="rounded-3xl border bg-gradient-to-br from-gray-50 to-white p-6 shadow-sm">
        <div className="max-w-3xl">
          <span className="rounded-full bg-black px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
            Need Help?
          </span>

          <h2 className="mt-4 text-3xl font-bold">Contact {vendor.name}</h2>

          <p className="mt-4 text-lg leading-8 text-gray-600">
            Have questions before placing your order? Need product
            recommendations or delivery information? Contact the seller
            directly.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {vendor.email && (
            <a
              href={`mailto:${vendor.email}`}
              className="group rounded-2xl border bg-white p-6 transition hover:shadow-lg"
            >
              <Mail className="mb-5 h-8 w-8" />

              <h3 className="font-semibold">Email</h3>

              <p className="mt-2 break-all text-sm text-gray-500">
                {vendor.email}
              </p>

              <div className="mt-6 flex items-center gap-2 font-medium">
                Send Email
                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-1"
                />
              </div>
            </a>
          )}

          {vendor.phone && (
            <a
              href={`tel:${vendor.phone}`}
              className="group rounded-2xl border bg-white p-6 transition hover:shadow-lg"
            >
              <Phone className="mb-5 h-8 w-8" />

              <h3 className="font-semibold">Call</h3>

              <p className="mt-2 text-sm text-gray-500">{vendor.phone}</p>

              <div className="mt-6 flex items-center gap-2 font-medium">
                Call Seller
                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-1"
                />
              </div>
            </a>
          )}

          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border bg-green-600 p-6 text-white transition hover:bg-green-700 hover:shadow-lg"
            >
              <MessageCircle className="mb-5 h-8 w-8" />

              <h3 className="font-semibold">WhatsApp</h3>

              <p className="mt-2 text-sm text-green-100">
                Chat instantly with the seller
              </p>

              <div className="mt-6 flex items-center gap-2 font-medium">
                Open WhatsApp
                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-1"
                />
              </div>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
