export type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
};

export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  // reviews?: Review[];
  description: string | null;
  sizes: string[];
  colours: string[];
  featured: boolean;
  averageRating: number;
  reviewCount: number;
  variants?: ProductVariant[];
  stock: number;
  discountedPrice: number | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
  vendor?: {
    id: string;
    storeName: string;
  };
  videos?: {
    url: string;
    public_id: string;
  }[];
  category?: {
    id: string;
    image?: string | null;
    slug: string;
    name: string;
    tenantId: string;
    isFeatured: boolean;
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
