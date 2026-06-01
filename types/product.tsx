export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  rating: number;
  reviews: number;
  description: string;
  sizes: string[];
  colours: string[];
  quantity: number;
  featured: boolean;
  averageRating?: number;
  reviewCount?: number;
  variants?: ProductVariant[];
  stock: number;
  videos?: {
    url: string;
    public_id: string;
  }[];
  category?: {
    name: string;
  };
}

export type ProductVariant = {
  id: string;
  color?: string | null;
  size?: string | null;
  price: number;
  image?: string | null;
  stock: number;
  colorHex: string;
};
