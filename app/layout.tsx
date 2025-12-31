import Header from "../components/header";
import Footer from "@/components/footer";
import { CartContextProvider } from "@/store/cart-context";
import { ProductContextProvider } from "@/store/products-context";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata = {
  title: "Urban Threads store",
  discription: "Selling trendy streetwear and accessories for men and women",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  <div className="bg-red-500 text-white p-10 text-3xl">
    Tailwind v3 works 🎉
  </div>;

  return (
    <html lang="en">
      <body>
        <ProductContextProvider>
          <CartContextProvider>
            <Header />
            {children}
            <Toaster position="top-center" reverseOrder={false} />
            <Footer />
          </CartContextProvider>
        </ProductContextProvider>
      </body>
    </html>
  );
}
