"use client";
import React, { useState, useContext, createContext, ReactNode } from "react";

export interface cartItem {
  id: number;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

interface cartContextType {
  cartItems: cartItem[];
  addToCart: (item: cartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  subTotal: number;
  clearCart: (id: number) => void;
}

const CartContext = createContext<cartContextType | undefined>(undefined);

export function CartContextProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<cartItem[]>([]);

  // Add items to Cart
  const addToCart = (item: cartItem) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((p) => p.id === item.id);

      // Increase the quantity if existing
      if (existing) {
        return prevItems.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + item.quantity } : p
        );
      }

      // Add item to cart if not existing
      return [...prevItems, item];
    });
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Remove item from cart
  const removeFromCart = (id: number) => {
    setCartItems((prev) => prev.filter((p) => p.id !== id));
  };

  // Update cart item
  const updateQuantity = (id: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Calculate sub Total
  const subTotal = cartItems.reduce((sum, cur) => sum + cur.price, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        subTotal,
        updateQuantity,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}


export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
