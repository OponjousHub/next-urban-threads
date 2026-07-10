"use client";

import { useState } from "react";

type PolicyTab = "shipping" | "returns" | "terms" | "privacy";

type Props = {
  shippingPolicy?: string | null;
  returnPolicy?: string | null;
  termsOfService?: string | null;
  privacyPolicy?: string | null;
};

export default function VendorPoliciesSection({
  shippingPolicy,
  returnPolicy,
  termsOfService,
  privacyPolicy,
}: Props) {
  const [tab, setTab] = useState<PolicyTab>("shipping");

  const tabs = [
    {
      key: "shipping",
      label: "Shipping",
    },
    {
      key: "returns",
      label: "Returns",
    },
    {
      key: "terms",
      label: "Terms",
    },
    {
      key: "privacy",
      label: "Privacy",
    },
  ];

  const content = {
    shipping: shippingPolicy || "<p>No shipping policy has been added.</p>",

    returns: returnPolicy || "<p>No return policy has been added.</p>",

    terms: termsOfService || "<p>No terms of service available.</p>",

    privacy: privacyPolicy || "<p>No privacy policy available.</p>",
  };

  return (
    <section className="mt-20">
      <div className="rounded-3xl border bg-white shadow-sm">
        <div className="border-b p-8">
          <h2 className="text-3xl font-bold">Store Policies</h2>
        </div>

        <div className="border-b px-8">
          <div className="flex gap-6 overflow-x-auto">
            {tabs.map((item) => (
              <button
                key={item.key}
                onClick={() => setTab(item.key as PolicyTab)}
                className={`relative whitespace-nowrap py-5 text-sm font-medium transition ${
                  tab === item.key
                    ? "text-black"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                {item.label}

                {tab === item.key && (
                  <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-black" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="prose prose-gray max-w-none p-8">
          <div
            dangerouslySetInnerHTML={{
              __html: content[tab],
            }}
          />
        </div>
      </div>
    </section>
  );
}
