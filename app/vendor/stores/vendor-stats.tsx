import { Store, Package, Users } from "lucide-react";

type Props = {
  totalStores: number;
  totalProducts: number;
  totalFollowers: number;
};

export default function VendorStats({
  totalStores,
  totalProducts,
  totalFollowers,
}: Props) {
  const stats = [
    {
      title: "Stores",
      value: totalStores.toLocaleString(),
      icon: Store,
      description: "Trusted vendors",
    },
    {
      title: "Products",
      value: totalProducts.toLocaleString(),
      icon: Package,
      description: "Available products",
    },
    {
      title: "Followers",
      value: totalFollowers.toLocaleString(),
      icon: Users,
      description: "Community members",
    },
  ];

  return (
    <section className="mt-12">
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="group rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>

                  <h3 className="mt-2 text-4xl font-bold text-gray-900">
                    {stat.value}
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    {stat.description}
                  </p>
                </div>

                <div className="rounded-2xl bg-[var(--color-primary)]/10 p-4 transition-colors duration-300 group-hover:bg-[var(--color-primary)]">
                  <Icon
                    size={28}
                    className="text-[var(--color-primary)] transition-colors duration-300 group-hover:text-white"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
