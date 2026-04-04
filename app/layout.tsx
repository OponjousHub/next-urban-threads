import Header from "../components/header";
import Footer from "@/components/footer";
import { CartContextProvider } from "@/store/cart-context";
import { ProductContextProvider } from "@/store/products-context";
import { TenantProvider } from "@/store/tenant-provider-context";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { getTenant } from "../lib/tenant/getTenant";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata = {
  title: "Urban Threads store",
  discription: "Selling trendy streetwear and accessories for men and women",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  <div className="bg-red-500 text-white p-10 text-3xl">
    Tailwind v3 works 🎉
  </div>;
  const storeInfo = await getDefaultTenant();
  const primaryColor = storeInfo?.primaryColor || "#6366f1";

  const tenant = await getTenant();

  const primaryDark = darkenColor(primaryColor, 20);
  const primaryLight = lightenColor(primaryColor, 20);

  return (
    <html lang="en">
      <body
        style={{
          ["--color-primary" as any]: primaryColor,
          ["--color-primary-dark" as any]: primaryDark,
          ["--color-primary-light" as any]: primaryLight,
        }}
      >
        <TenantProvider tenant={tenant}>
          <ProductContextProvider>
            <CartContextProvider>
              <Header />
              {children}
              <Toaster position="top-center" reverseOrder={false} />
              <Footer />
            </CartContextProvider>
          </ProductContextProvider>
        </TenantProvider>
      </body>
    </html>
  );
}
