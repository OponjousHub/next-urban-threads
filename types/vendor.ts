export type Vendor = {
  id: string;
  name: string;
  slug: string;

  logo?: string | null;

  email?: string | null;

  phone?: string | null;

  status: string;

  createdAt: string;

  users: {
    id: string;
    name: string | null;
    email: string;
  }[];

  _count: {
    products: number;
    orders: number;
  };
};
