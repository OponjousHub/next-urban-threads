import { OrderStatus, PaymentStatus } from "@prisma/client";

export type Action =
  | { type: "status"; value: OrderStatus }
  | { type: "payment"; value: PaymentStatus };

export type OrderActionItem = {
  label: string;
  action: () => void;
  disabled?: boolean;
  danger?: boolean;
};

export const STATUS_ORDER: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export const STATUS_CONFIG: Partial<
  Record<OrderStatus, { title: string; message: string }>
> = {
  PENDING: {
    title: "Order placed",
    message: "Your order has been received",
  },

  PROCESSING: {
    title: "Processing",
    message: "We are preparing your order",
  },

  SHIPPED: {
    title: "Shipped",
    message: "Your package has left our warehouse",
  },

  OUT_FOR_DELIVERY: {
    title: "Out for delivery",
    message: "Your package is out for delivery and will arrive today",
  },

  DELIVERED: {
    title: "Delivered",
    message: "Your order has been delivered",
  },

  CANCELLED: {
    title: "Cancelled",
    message: "Order has been cancelled",
  },
};

type OrderLike = {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
};

type BuildOrderActionsParams = {
  order: OrderLike;
  basePath: string;

  onViewDetails: () => void;
  onViewTracking: () => void;

  onPaymentUpdate: () => void;

  onStatusUpdate: (status: OrderStatus) => void;

  onCancel: () => void;
};

export function buildOrderActions({
  order,
  onViewDetails,
  onViewTracking,
  onPaymentUpdate,
  onStatusUpdate,
  onCancel,
}: BuildOrderActionsParams): OrderActionItem[] {
  const actions: OrderActionItem[] = [];

  /* ---------------- VIEW ---------------- */

  actions.push({
    label: "View details",
    action: onViewDetails,
  });

  actions.push({
    label: "View tracking",
    action: onViewTracking,
  });

  /* ---------------- PAYMENT ---------------- */

  actions.push({
    label: order.paymentStatus === "PAID" ? "✓ Already Paid" : "Mark as paid",

    disabled: order.paymentStatus === "PAID",

    action: () => {
      if (order.paymentStatus === "PAID") return;

      onPaymentUpdate();
    },
  });

  /* ---------------- STATUS ---------------- */

  const currentIndex = STATUS_ORDER.indexOf(order.status);

  STATUS_ORDER.forEach((status) => {
    const statusIndex = STATUS_ORDER.indexOf(status);

    const disabled =
      statusIndex <= currentIndex ||
      order.status === "DELIVERED" ||
      order.status === "CANCELLED";

    const title = STATUS_CONFIG[status]?.title ?? status;

    actions.push({
      label: statusIndex < currentIndex ? `✓ ${title}` : title,

      disabled,

      action: () => {
        if (disabled) return;

        onStatusUpdate(status);
      },
    });
  });

  /* ---------------- CANCEL ---------------- */

  const cancelDisabled =
    order.status === "DELIVERED" || order.status === "CANCELLED";

  actions.push({
    label:
      order.status === "CANCELLED"
        ? "Order Cancelled"
        : order.status === "DELIVERED"
          ? "Delivered (Cannot Cancel)"
          : "Cancel Order",

    danger: true,
    disabled: cancelDisabled,

    action: () => {
      if (cancelDisabled) return;

      onCancel();
    },
  });

  return actions;
}
