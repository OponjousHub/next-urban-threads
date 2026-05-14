export interface CartItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  stock: number;
  productId: string;
  // VARIANT
  variantId?: string;
  variantColor?: string;
  variantSize?: string;
}
