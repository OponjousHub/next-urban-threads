export interface Product {
  id: number;
  name: string;
  price: number;
  images: string[];
  category: "MEN" | "WOMEN" | "ACCESSORIES";
  rating: number;
  reviews: number;
  description: string;
  sizes: string[];
  colours: string[];
  quantity: number;
  featured: boolean;
}
