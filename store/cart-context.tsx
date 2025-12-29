"use client";
import React, {
  useState,
  useContext,
  createContext,
  ReactNode,
  useEffect,
} from "react";
import { CartItem } from "@/types/cart";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  subTotal: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartContextProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Load Cart from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) setCartItems(JSON.parse(stored));
    } catch (err) {
      console.error("Error reading cart from localStorage:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Save cart to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoading]);

  // ✅ Add to Cart
  const addToCart = (item: CartItem) => {
    console.log(item);
    setCartItems((prevItems) => {
      const existing = prevItems.find((p) => p.id === item.id);
      if (existing) {
        return prevItems.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  // ✅ Clear cart
  const clearCart = () => {
    localStorage.removeItem("cart");
    setCartItems([]);
  };

  // ✅ Remove item
  const removeFromCart = (id: number) => {
    setCartItems((prev) => prev.filter((p) => p.id !== id));
  };

  // ✅ Update quantity
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

  // ✅ Calculate subtotal correctly
  const subTotal = cartItems.reduce(
    (sum, cur) => sum + cur.price * cur.quantity,
    0
  );

  if (isLoading) return null; // Return nothing during load to avoid Hook mismatch

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        subTotal,
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
    throw new Error("useCart must be used within a CartContextProvider");
  }
  return context;
}
