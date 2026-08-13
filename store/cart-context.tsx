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

  const storeMode = tenant?.storeMode ?? "SINGLE_VENDOR";

  const cartKey = `cart_${storeMode}`;
  const couponKey = `appliedCoupon_${storeMode}`;
  const discountKey = `discountAmount_${storeMode}`;

  // ---------------------------------------------------------
  // Load cart for current store mode
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
  // Restore coupon for current store mode
  // ---------------------------------------------------------

  useEffect(() => {
    try {
      const storedCoupon = localStorage.getItem(couponKey);

      const storedDiscount = localStorage.getItem(discountKey);

      if (storedCoupon) {
        const parsedCoupon = JSON.parse(storedCoupon) as AppliedCoupon;

        // Never restore vendor coupons in SINGLE_VENDOR
        if (
          storeMode === "SINGLE_VENDOR" &&
          (
            parsedCoupon as AppliedCoupon & {
              vendorId?: string | null;
            }
          ).vendorId
        ) {
          localStorage.removeItem(couponKey);
          localStorage.removeItem(discountKey);

          setCoupon(null);
          setDiscountAmount(0);

          return;
        }

        setCoupon(parsedCoupon);
      } else {
        setCoupon(null);
      }

      if (storedDiscount) {
        setDiscountAmount(Number(JSON.parse(storedDiscount)));
      } else {
        setDiscountAmount(0);
      }
    } catch (error) {
      console.error("Error restoring coupon:", error);

      setCoupon(null);
      setDiscountAmount(0);
    }
  }, [couponKey, discountKey, storeMode]);

  // ---------------------------------------------------------
  // Persist coupon
  // ---------------------------------------------------------

  useEffect(() => {
    if (coupon) {
      localStorage.setItem(couponKey, JSON.stringify(coupon));
    } else {
      localStorage.removeItem(couponKey);
    }

    localStorage.setItem(discountKey, JSON.stringify(discountAmount));
  }, [coupon, discountAmount, couponKey, discountKey]);

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

    removeCoupon();
  };

  // ---------------------------------------------------------
  // Remove item
  // ---------------------------------------------------------

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((p) => p.id !== id));
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
  // Calculate subtotal
  // ---------------------------------------------------------

  const subTotal = cartItems.reduce(
    (sum, cur) => sum + cur.price * cur.quantity,
    0,
  );

  // ---------------------------------------------------------
  // Remove coupon
  // ---------------------------------------------------------

  function removeCoupon() {
    setCoupon(null);
    setDiscountAmount(0);

    localStorage.removeItem(couponKey);
    localStorage.removeItem(discountKey);
  }

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
