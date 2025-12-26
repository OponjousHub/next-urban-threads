export interface Product {
  id: number;
  name: string;
  price: number;
  images: string[];
  category: "men" | "women" | "accessory";
  rating: number;
  reviews: number;
  description: string;
  sizes: string[];
  quantity: number;
}
