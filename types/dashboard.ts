export type DashboardStats = {
  totalOrders: number;
  pendingOrders: number;
  totalSpent: number;

  recentOrders: RecentOrder[];

  defaultAddress: Address | null;
  user: DashboardUser | null;
  addresses: Address[];
};

export type RecentOrder = {
  id: string;
  userId: string;
  status: string; // or OrderStatus if shared safely
  paymentMethod: string | null;
  paymentProvider: string | null;
  paymentReference: string | null;
  currency: string;

  createdAt: string; // serialized ISO date
  totalAmount: number;

  shippingAddress: Address | null;

  items: RecentOrderItem[];
};

export type RecentOrderItem = {
  id: string;
  productId: string;
  quantity: number;
  price: number;

  product: {
    name: string;
    images: string[];
  } | null;
};

export type DashboardUser = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: Date;
  passwordUpdatedAt: Date | null;
  twoFactorEnabled: Boolean;
  status: string; // or UserStatus enum if shared
};

export type Address = {
  id: string;
  userId: string;
  tenantId: string;

  fullName: string | null;
  street: string;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
  phone: string | null;

  isDefault: boolean;
  isTemporary: boolean;
  isDeleted: boolean;

  createdAt: Date;
};
