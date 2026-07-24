import Link from "next/link";
import { prisma } from "@/utils/prisma";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
import { AlertTriangle, Package2, Pencil } from "lucide-react";
import VendorHeader from "@/components/vendor/vendorHeader";

export default async function LowStockPage() {
  const { vendorId, vendor } = await getCurrentVendor();

  const variants = await prisma.productVariant.findMany({
    where: {
      stock: {
        lte: 5,
      },
      product: {
        vendorId,
      },
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          thumbnail: true,
        },
      },
    },
    orderBy: {
      stock: "asc",
    },
  });

  return (
    <>
      {/* Header */}
      <VendorHeader
        title="Inventory Alerts"
        subtitle="Variants that require your attention."
        vendor={vendor!}
      />
      <div className="mx-auto max-w-7xl space-y-8 p-6">
        <div className="flex items-center justify-between">
          <div className="rounded-xl bg-orange-50 px-4 py-2 font-medium text-orange-700">
            {variants.length} Alerts
          </div>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="font-semibold">
              Low Stock &amp; Out of Stock Variants
            </h2>
          </div>

          {variants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Package2 className="mb-4 h-14 w-14 text-gray-300" />

              <h3 className="text-lg font-semibold">Inventory looks healthy</h3>

              <p className="mt-2 text-sm text-gray-500">
                No variants require attention.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {variants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between px-6 py-5"
                >
                  <div className="flex items-center gap-5">
                    <img
                      src={
                        variant.image ||
                        variant.product.thumbnail ||
                        "/placeholder.png"
                      }
                      alt={variant.product.name}
                      className="h-16 w-16 rounded-xl border object-cover"
                    />

                    <div>
                      <h3 className="font-semibold">{variant.product.name}</h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {[variant.color, variant.size]
                          .filter(Boolean)
                          .join(" / ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {variant.stock === 0 ? (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
                        {variant.stock} left
                      </span>
                    )}

                    <Link
                      href={`/vendor/products/${variant.product.id}/edit`}
                      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition hover:bg-gray-50"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Tip */}
        <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-orange-600" />

          <div>
            <h4 className="font-medium text-orange-800">Inventory Tip</h4>

            <p className="mt-1 text-sm text-orange-700">
              Keep your best-selling variants stocked to avoid missed sales.
              Restocking before inventory reaches zero improves customer
              satisfaction and prevents abandoned checkouts.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
