export type Vendor = {
  id: string;
  name: string;
  slug: string;

  logo?: string | null;

  email?: string | null;

  phone?: string | null;

  status: string;

  createdAt: string;

  suspensionReason: string;

  users: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
  }[];

  _count: {
    products: number;
    orders: number;
  };
};

export type VendorApplication = {
  id: string;

  userId: string;

  businessName: string;
  businessEmail?: string | null;
  businessPhone?: string | null;

  description?: string | null;

  status: string;

  rejectionReason?: string | null;

  reviewedAt?: string | null;
  reviewedBy?: string | null;

  createdAt: string;
  updatedAt: string;
};

export type VendorDashboard = {
  revenue: number;
  orders: number;
  products: number;
  pendingOrders: number;

  recentOrders: any[];

  lowStockProducts: {
    id: string;
    name: string;
    stock: number;
    thumbnail: string;
  }[];
};

export type VendorHeaderProps = {
  title: string;
  subtitle?: string;
  vendor: {
    name?: string;
    status?: string;
    logo?: string | null;
  } | null;
};
