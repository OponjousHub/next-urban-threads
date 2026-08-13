"use client";

import React, {
  useState,
  useContext,
  createContext,
  ReactNode,
  useEffect,
} from "react";

import { CartItem, AppliedCoupon } from "@/types/cart";
import { appToast } from "@/utils/appToast";
import { useTenant } from "@/store/tenant-provider-context";

interface CartContextType {
  cartItems: CartItem[];

  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;

  subTotal: number;
  clearCart: () => void;

  coupons: AppliedCoupon[];
  setCoupons: React.Dispatch<React.SetStateAction<AppliedCoupon[]>>;

  discountAmount: number;
  setDiscountAmount: React.Dispatch<React.SetStateAction<number>>;

  removeCoupon: (couponId: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartContextProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [coupons, setCoupons] = useState<AppliedCoupon[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);

  const { tenant } = useTenant();

  const cartKey = `cart_${tenant.storeMode}`;

  const couponKey = `appliedCoupons_${tenant.storeMode}`;
  const discountKey = `discountAmount_${tenant.storeMode}`;

  // ---------------------------------------------------------
  // Load cart
  // ---------------------------------------------------------

  useEffect(() => {
    try {
      const stored = localStorage.getItem(cartKey);

      if (stored) {
        setCartItems(JSON.parse(stored));
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error reading cart from localStorage:", error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [cartKey]);

  // ---------------------------------------------------------
  // Save cart
  // ---------------------------------------------------------

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    }
  }, [cartItems, isLoading, cartKey]);

  // ---------------------------------------------------------
  // Restore coupons for current store mode
  // ---------------------------------------------------------

  useEffect(() => {
    try {
      const storedCoupons = localStorage.getItem(couponKey);
      const storedDiscount = localStorage.getItem(discountKey);

      setCoupons(storedCoupons ? JSON.parse(storedCoupons) : []);

      setDiscountAmount(
        storedDiscount ? Number(JSON.parse(storedDiscount)) : 0,
      );
    } catch (error) {
      console.error("Error restoring coupons:", error);

      setCoupons([]);
      setDiscountAmount(0);
    }
  }, [couponKey, discountKey]);

  // ---------------------------------------------------------
  // Persist coupons
  // ---------------------------------------------------------

  useEffect(() => {
    localStorage.setItem(couponKey, JSON.stringify(coupons));

    localStorage.setItem(discountKey, JSON.stringify(discountAmount));
  }, [coupons, discountAmount, couponKey, discountKey]);

  // ---------------------------------------------------------
  // Add to cart
  // ---------------------------------------------------------

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
          p.id === item.id
            ? {
                ...p,
                quantity: newQty,
              }
            : p,
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

  // ---------------------------------------------------------
  // Clear cart
  // ---------------------------------------------------------

  const clearCart = () => {
    localStorage.removeItem(cartKey);

    setCartItems([]);

    setCoupons([]);
    setDiscountAmount(0);

    localStorage.removeItem(couponKey);
    localStorage.removeItem(discountKey);
  };

  // ---------------------------------------------------------
  // Remove item
  // ---------------------------------------------------------

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // ---------------------------------------------------------
  // Update quantity
  // ---------------------------------------------------------

  const updateQuantity = (id: string, delta: number) => {
    let errorMessage = "";

    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) {
            return item;
          }

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

  // ---------------------------------------------------------
  // Subtotal
  // ---------------------------------------------------------

  const subTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // ---------------------------------------------------------
  // Remove ONE coupon
  // ---------------------------------------------------------

  const removeCoupon = (couponId: string) => {
    setCoupons((prev) => prev.filter((coupon) => coupon.id !== couponId));
  };

  // ---------------------------------------------------------
  // Loading
  // ---------------------------------------------------------

  if (isLoading) {
    return null;
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,

        addToCart,
        removeFromCart,
        updateQuantity,

        subTotal,
        clearCart,

        coupons,
        setCoupons,

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
