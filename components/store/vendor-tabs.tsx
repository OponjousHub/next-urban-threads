"use client";

type Tab = "products" | "about" | "reviews" | "policies";

type Props = {
  active: Tab;
  onChange: (tab: Tab) => void;
};

const tabs: {
  key: Tab;
  label: string;
}[] = [
  {
    key: "products",
    label: "Products",
  },
  {
    key: "about",
    label: "About",
  },
  {
    key: "reviews",
    label: "Reviews",
  },
  {
    key: "policies",
    label: "Policies",
  },
];

export default function VendorTabs({ active, onChange }: Props) {
  return (
    <div className="sticky top-0 z-20 mt-14 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl gap-8 overflow-x-auto px-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`relative whitespace-nowrap py-5 text-sm font-medium transition ${
              active === tab.key
                ? "text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {tab.label}

            {active === tab.key && (
              <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-black" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
