import { OrderStatus, PaymentStatus } from "@prisma/client";

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
      value: OrderStatus;
    }
  | {
      type: "payment";
      value: PaymentStatus;
    };
