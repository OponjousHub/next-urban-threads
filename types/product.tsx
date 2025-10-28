export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: "men" | "women" | "all product";
}
