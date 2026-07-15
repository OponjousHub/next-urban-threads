import VendorCard from "./vendor-card";

type Vendor = {
  id: string;
  slug: string;
  storeName: string;
  logo: string | null;
  banner: string | null;

  _count: {
    followers: number;
    products: number;
  };
};

type Props = {
  vendors: Vendor[];
};

export default function VendorGrid({ vendors }: Props) {
  return (
    <section className="mt-10">
      <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        {vendors.map((vendor) => (
          <VendorCard key={vendor.id} vendor={vendor} />
        ))}
      </div>
    </section>
  );
}
