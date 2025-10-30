export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: "men" | "women" | "accessory";
  rating: number;
  reviews: number;
  description: string;
  sizes: string[];
}
