"use client";
import React, {
  useState,
  useContext,
  createContext,
  ReactNode,
  useEffect,
} from "react";
import { CartItem } from "@/types/cart";
import toast from "react-hot-toast";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
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
    let errorMessage = "";
    let successMessage = "";

    setCartItems((prevItems) => {
      const existing = prevItems.find((p) => p.id === item.id);

      if (existing) {
        const newQty = existing.quantity + (item.quantity || 1);

        if (newQty > item.stock) {
          errorMessage = `Only ${item.stock} available`;
          return prevItems;
        }

        successMessage = "Cart updated";

        return prevItems.map((p) =>
          p.id === item.id ? { ...p, quantity: newQty } : p,
        );
      }

      if (item.stock < 1) {
        errorMessage = "Out of stock";
        return prevItems;
      }

      successMessage = "Added to cart";

      return [
        ...prevItems,
        {
          ...item,
          quantity: item.quantity || 1,
        },
      ];
    });

    if (errorMessage) {
      toast.error(errorMessage);
    }

    if (successMessage) {
      toast.success(successMessage);
    }
  };

  // ✅ Clear cart
  const clearCart = () => {
    localStorage.removeItem("cart");
    setCartItems([]);
  };

  // ✅ Remove item
  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((p) => p.id !== id));
  };

  // ✅ Update quantity
  const updateQuantity = (id: string, delta: number) => {
    let errorMessage = "";
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;

          const newQty = item.quantity + delta;

          if (newQty > item.stock) {
            errorMessage = `Only ${item.stock} in stock`;
            // toast.error(`Only ${item.stock} in stock`);
            return item;
          }

          return {
            ...item,
            quantity: Math.max(1, newQty),
          };
        })
        .filter((item) => item.quantity > 0),
    );
    if (errorMessage) {
      toast.error(errorMessage);
    }
  };

  // ✅ Calculate subtotal correctly
  const subTotal = cartItems.reduce(
    (sum, cur) => sum + cur.price * cur.quantity,
    0,
  );

  if (isLoading) return null; // Return nothing during load to avoid Hook mismatch
  console.log("CART ITEMS---------", cartItems);
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
