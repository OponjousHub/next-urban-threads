"use client";

import { createContext, useState, useContext, useEffect } from "react";
import { menProducts as menData } from "@/data/products";
import { womenProducts as womenData } from "@/data/products";
import { Product } from "@/types/product";

interface ProductContextType {
  menProducts: Product[];
  womenProducts: Product[];
  allProducts: Product[];
  setMenProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setWomenProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export const ProductContext = createContext<ProductContextType | undefined>(
  undefined
);

export function ProductContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menProducts, setMenProducts] = useState<Product[]>([]);
  const [womenProducts, setWomenProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    setMenProducts(menData);
    setWomenProducts(womenData)
  },[]);

  return (
    <ProductContext.Provider
      value={{
        menProducts,
        womenProducts,
        allProducts,
        setMenProducts,
        setWomenProducts,
        setAllProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const productContext = useContext(ProductContext);
  if (!productContext) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return productContext;
}
