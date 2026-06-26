"use client";
import React, {
  useState,
  useContext,
  createContext,
  ReactNode,
  useEffect,
} from "react";
import { CartItem } from "@/types/cart";
import { appToast } from "@/utils/appToast";
import { useTenant } from "@/store/tenant-provider-context";
import { AppliedCoupon } from "@/types/cart";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  subTotal: number;
  clearCart: () => void;
  coupon: AppliedCoupon | null;
  setCoupon: React.Dispatch<React.SetStateAction<AppliedCoupon | null>>;
  discountAmount: number;
  setDiscountAmount: React.Dispatch<React.SetStateAction<number>>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartContextProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const { tenant } = useTenant();
  const cartKey = `cart_${tenant.storeMode}`;

  // ✅ Load Cart from localStorage

  useEffect(() => {
    try {
      const stored = localStorage.getItem(cartKey);

      if (stored) {
        setCartItems(JSON.parse(stored));
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error("Error reading cart from localStorage:", err);
    } finally {
      setIsLoading(false);
    }
  }, [cartKey]);

  // ✅ Save cart to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    }
  }, [cartItems, isLoading]);

  // Persisting Coupon on Local Storage
  useEffect(() => {
    localStorage.setItem("appliedCoupon", JSON.stringify(coupon));

    localStorage.setItem("discountAmount", JSON.stringify(discountAmount));
  }, [coupon, discountAmount]);

  // Restore on Refresh
  useEffect(() => {
    const storedCoupon = localStorage.getItem("appliedCoupon");
    const storedDiscount = localStorage.getItem("discountAmount");

    if (storedCoupon) {
      setCoupon(JSON.parse(storedCoupon));
    }

    if (storedDiscount) {
      setDiscountAmount(JSON.parse(storedDiscount));
    }
  }, []);

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
      appToast.error("Error", errorMessage);
    }

    if (successMessage) {
      appToast.success("Success", successMessage);
    }
  };

  // ✅ Clear cart
  const clearCart = () => {
    localStorage.removeItem(cartKey);
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
      appToast.error("Error", errorMessage);
    }
  };

  // ✅ Calculate subtotal correctly
  const subTotal = cartItems.reduce(
    (sum, cur) => sum + cur.price * cur.quantity,
    0,
  );

  // Remove coupon
  function removeCoupon() {
    setCoupon(null);

    setDiscountAmount(0);

    localStorage.removeItem("appliedCoupon");

    localStorage.removeItem("discountAmount");
  }

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
        coupon,
        setCoupon,
        discountAmount,
        setDiscountAmount,
        removeCoupon,
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
