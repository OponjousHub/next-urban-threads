import Header from "../components/header";
import Footer from "@/components/footer";
import { CartContextProvider } from "@/store/cart-context";
import { ProductContextProvider } from "@/store/products-context";
import { TenantProvider } from "@/store/tenant-provider-context";
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

  const tenant = await getTenant();

  return (
    <html lang="en">
      <body>
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
