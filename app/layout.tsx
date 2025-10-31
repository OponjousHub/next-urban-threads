import Header from "../components/header";
import Footer from "@/components/footer";
import { CartContextProvider } from "@/store/cart-context";
import { ProductContextProvider } from "@/store/products-context";
import { Toaster } from "react-hot-toast";
import "./tailwind-output.css";

export const metadata = {
  title: "Urban Threads store",
  discription: "Selling trendy streetwear and accessories for men and women",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
