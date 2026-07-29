import {
  ShoppingCart,
  Package,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Store,
  CheckCircle,
  Star,
  Bell,
  LucideIcon,
} from "lucide-react";

type NotificationIconMap = Record<string, LucideIcon>;

const iconMap: NotificationIconMap = {
  // Orders
  NEW_ORDER: ShoppingCart,
  ORDER_CANCELLED: XCircle,
  ORDER_DELIVERED: Package,

  // Refunds
  REFUND_REQUESTED: RotateCcw,

  // Inventory
  LOW_STOCK: AlertTriangle,
  OUT_OF_STOCK: AlertTriangle,

  // Vendors
  NEW_VENDOR_APPLICATION: Store,
  VENDOR_APPROVED: CheckCircle,

  // Reviews
  NEW_REVIEW: Star,
};

export function getNotificationIcon(type: string): LucideIcon {
  return iconMap[type] ?? Bell;
}
