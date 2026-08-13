export interface CartItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  stock: number;
  productId: string;
  variantId?: string;
  variantColor?: string;
  variantSize?: string;
}

export type CouponData = {
  id: string;
  code: string;
  description: string | null;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minimumAmount?: number | null;
  vendorId?: string | null;
};

export type AppliedCoupon = {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  vendorId?: string | null;
};
