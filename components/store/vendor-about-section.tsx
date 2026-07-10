"use client";

import {
  MapPin,
  CalendarDays,
  Star,
  Package,
  Users,
  ShieldCheck,
  BadgeCheck,
  Zap,
} from "lucide-react";

type Props = {
  vendor: any;
  averageRating: number;
  totalReviews: number;
  followers: number;
};

export default function VendorAboutSection({
  vendor,
  averageRating,
  totalReviews,
  followers,
}: Props) {
  return (
    <section className="mt-20">
      <div className="rounded-3xl border bg-white p-10 shadow-sm">
        <div className="mb-10">
          <h2 className="text-3xl font-bold">About this store</h2>

          <p className="mt-6 leading-8 text-gray-600">
            {vendor.description ||
              "This vendor hasn't added a store description yet."}
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* LEFT */}

          <div>
            <h3 className="mb-6 text-xl font-semibold">Store Information</h3>

            <div className="space-y-5">
              <InfoRow
                icon={<MapPin size={20} />}
                label="Country"
                value={vendor.country || "Not specified"}
              />

              <InfoRow
                icon={<MapPin size={20} />}
                label="City"
                value={vendor.city || "Not specified"}
              />

              <InfoRow
                icon={<CalendarDays size={20} />}
                label="Joined"
                value={new Date(vendor.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              />

              <InfoRow
                icon={<Star size={20} />}
                label="Rating"
                value={`${averageRating.toFixed(1)} (${totalReviews} Reviews)`}
              />

              <InfoRow
                icon={<Users size={20} />}
                label="Followers"
                value={followers.toLocaleString()}
              />

              <InfoRow
                icon={<Package size={20} />}
                label="Products"
                value={vendor.products.length.toString()}
              />
            </div>
          </div>

          {/* RIGHT */}

          <div>
            <h3 className="mb-6 text-xl font-semibold">Why shop here?</h3>

            <div className="grid gap-4">
              <Feature
                icon={<BadgeCheck size={22} />}
                title="Verified Store"
                text="Identity verified by Urban Threads."
              />

              <Feature
                icon={<Zap size={22} />}
                title="Fast Response"
                text="Usually responds within 24 hours."
              />

              <Feature
                icon={<ShieldCheck size={22} />}
                title="Secure Payments"
                text="All orders are protected."
              />

              <Feature
                icon={<Star size={22} />}
                title="Trusted Seller"
                text="Built a positive reputation through customer reviews."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b pb-4">
      <div className="flex items-center gap-3 text-gray-600">
        {icon}
        <span>{label}</span>
      </div>

      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-gray-100 p-3">{icon}</div>

        <div>
          <h4 className="font-semibold">{title}</h4>

          <p className="text-sm text-gray-600">{text}</p>
        </div>
      </div>
    </div>
  );
}
