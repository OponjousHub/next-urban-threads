import ProductSearch from "@/components/products/product-search";
import ProductFilters from "@/components/products/product-filters";
import ProductSort from "@/components/products/product-sorting";
import Pagination from "@/components/products/product-pagination";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { prisma } from "@/utils/prisma";
import Link from "next/link";
import ProductsTable from "@/components/products/product-table";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";
import { getAuthPayload } from "@/lib/server/auth";
import { redirect } from "next/navigation";

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    stock?: string;
    featured?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  /* =========================================================
     AUTH
  ========================================================= */

  const { userId, role } = await getAuthPayload();

  if (!userId) {
    redirect("/login");
  }

  if (role !== "ADMIN" && role !== "OWNER") {
    redirect("/");
  }

  /* =========================================================
     TENANT
  ========================================================= */

  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  /* =========================================================
     SEARCH PARAMS
  ========================================================= */

  const params = await searchParams;

  const q = params.q?.trim() || "";
  const category = params.category || "";
  const stock = params.stock || "";
  const featured = params.featured || "";
  const sort = params.sort || "newest";

  const page = Math.max(Number(params.page) || 1, 1);
  const pageSize = 10;

  const skip = (page - 1) * pageSize;

  /* =========================================================
     SORTING
  ========================================================= */

  let orderBy:
    | { createdAt: "asc" | "desc" }
    | { price: "asc" | "desc" }
    | { stock: "asc" | "desc" }
    | { name: "asc" | "desc" };

  switch (sort) {
    case "price_asc":
      orderBy = {
        price: "asc",
      };
      break;

    case "price_desc":
      orderBy = {
        price: "desc",
      };
      break;

    case "stock":
      orderBy = {
        stock: "asc",
      };
      break;

    case "name_asc":
      orderBy = {
        name: "asc",
      };
      break;

    case "name_desc":
      orderBy = {
        name: "desc",
      };
      break;

    case "oldest":
      orderBy = {
        createdAt: "asc",
      };
      break;

    case "newest":
    default:
      orderBy = {
        createdAt: "desc",
      };
      break;
  }

  /* =========================================================
     WHERE FILTERS
  ========================================================= */

  const where = {
    deletedAt: null,

    tenantId: tenant.id,

    storeMode: tenant.storeMode,

    ...(q
      ? {
          OR: [
            {
              name: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),

    ...(category
      ? {
          category: {
            slug: category.toLowerCase(),
          },
        }
      : {}),

    ...(featured
      ? {
          featured: featured === "true",
        }
      : {}),

    ...(stock === "low"
      ? {
          stock: {
            lte: 5,
            gt: 0,
          },
        }
      : {}),

    ...(stock === "out"
      ? {
          stock: 0,
        }
      : {}),
  };

  /* =========================================================
     FETCH DATA
  ========================================================= */

  const [products, totalProducts, user, categories] = await Promise.all([
    prisma.product.findMany({
      where,

      orderBy,

      skip,
      take: pageSize,
    }),

    prisma.product.count({
      where,
    }),

    prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        name: true,
        email: true,
        avatarUrl: true,
      },
    }),

    // Categories for the product filter
    prisma.category.findMany({
      where: {
        tenantId: tenant.id,
        // storeMode: tenant.storeMode,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
  ]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.ceil(totalProducts / pageSize);

  /* =========================================================
     SERIALIZE DECIMALS
  ========================================================= */

  const safeProducts = products.map((product) => ({
    ...product,
    price: Number(product.price),
  }));

  /* =========================================================
     ADMIN
  ========================================================= */

  const admin = {
    name: user?.name,
    email: user?.email,
    avatarUrl: user?.avatarUrl,
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <AdminHeaderUI
        title="Products"
        subtitle="Manage your products, inventory and catalog"
        admin={admin}
      />

      <div className="space-y-5">
        {/* =====================================================
            PRODUCTS TOOLBAR
        ===================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="p-4 lg:p-5">
            {/* Search + Add Product */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              {/* Search */}

              <div className="min-w-0 flex-1">
                <ProductSearch basePath="/admin/products" />
              </div>

              {/* Add Product */}

              <Link
                href="/admin/products/new"
                className="
                  inline-flex
                  h-11
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-black
                  px-5
                  text-sm
                  font-medium
                  text-white
                  shadow-sm
                  transition
                  hover:bg-gray-800
                  active:scale-[0.98]
                "
              >
                <span className="text-lg leading-none">+</span>
                Add Product
              </Link>
            </div>

            {/* Filters + Sort */}

            <div className="mt-5 border-t border-gray-100 pt-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Existing Filters */}

                <div className="min-w-0 flex-1">
                  <ProductFilters categories={categories} />
                </div>

                {/* Sort */}
                <div className="shrink-0">
                  <ProductSort />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            SEARCH RESULT
        ===================================================== */}

        {q && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Showing results for</span>

            <span className="rounded-md bg-gray-100 px-2 py-1 font-medium text-gray-900">
              "{q}"
            </span>
          </div>
        )}

        {/* =====================================================
            PRODUCT TABLE
        ===================================================== */}

        <ProductsTable
          products={safeProducts}
          query={q}
          basePath="/admin/products"
        />

        {/* =====================================================
            PAGINATION
        ===================================================== */}

        <Pagination totalPages={totalPages} />
      </div>
    </>
  );
}
