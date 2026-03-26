export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export type Order = {
  id: string;
  createdAt: Date;
  total: number;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  itemsCount: number;
  customer: { name: string; email: string } | null;
};

export type Action =
  | {
      type: "status";
      value: "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    }
  | {
      type: "payment";
      value: "PAID";
    };
