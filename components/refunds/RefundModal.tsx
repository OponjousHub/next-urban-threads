"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DialogTitle } from "@/components/ui/dialog";
import toast from "react-hot-toast";

type Props = {
  order: any;
  onClose: () => void;
};

export default function RefundModal({ order, onClose }: Props) {
  const router = useRouter();

  const [selectedItems, setSelectedItems] = useState<any>({});
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleItem(item: any) {
    setSelectedItems((prev: any) => {
      const exists = prev[item.id];

      if (exists) {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      }

      return {
        ...prev,
        [item.id]: {
          productId: item.product.id,
          quantity: 1,
          price: item.product.price,
        },
      };
    });
  }

  function updateQuantity(itemId: string, quantity: number) {
    setSelectedItems((prev: any) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        quantity: Number(quantity),
      },
    }));
  }

  const totalRefund = Object.values(selectedItems).reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0,
  );

  async function handleSubmit() {
    if (!reason) {
      toast.error("Please select a reason");
      return;
    }

    if (Object.keys(selectedItems).length === 0) {
      toast.error("Please select at least one item");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Submitting refund...");
    try {
      await fetch("/api/refunds/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          items: Object.values(selectedItems),
          reason,
          description,
        }),
      });

      toast.success("Refund request submitted", { id: toastId });

      onClose();
      router.refresh();
    } catch (err) {
      toast.error("Failed to submit refund", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <DialogTitle className="text-xl font-semibold">
        Request Refund
      </DialogTitle>
      {/* ITEMS */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {order.items.map((item: any) => {
          const selected = selectedItems[item.id];

          return (
            <div
              key={item.id}
              className="flex items-center gap-3 border p-3 rounded-lg"
            >
              <input
                type="checkbox"
                checked={!!selected}
                onChange={() => toggleItem(item)}
              />

              <img src={item.product.images[0]} className="w-12 h-12 rounded" />

              <div className="flex-1">
                <p>{item.product.name}</p>
                <p className="text-sm text-gray-500">
                  ₦{item.product.price} × {item.quantity}
                </p>
              </div>

              {selected && (
                <input
                  type="number"
                  min={1}
                  max={item.quantity}
                  value={selected.quantity}
                  onChange={(e) =>
                    updateQuantity(item.id, Number(e.target.value))
                  }
                  className="w-16 border rounded p-1"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* REASON */}
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full border p-2 rounded-lg"
      >
        <option value="">Select reason</option>
        <option value="damaged">Item damaged</option>
        <option value="wrong_item">Wrong item</option>
        <option value="not_as_described">Not as described</option>
        <option value="late_delivery">Late delivery</option>
        <option value="other">Other</option>
      </select>

      {/* DESCRIPTION */}
      <textarea
        placeholder="Additional details..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border p-2 rounded-lg"
      />

      {/* TOTAL */}
      <div className="flex justify-between items-center">
        <span className="font-medium">Refund Total:</span>
        <span className="text-lg font-bold">₦{totalRefund}</span>
      </div>

      {/* ACTION */}
      <button
        onClick={handleSubmit}
        disabled={loading || Object.keys(selectedItems).length === 0}
        className="w-full bg-black text-white py-3 rounded-xl disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Refund Request"}
      </button>
    </div>
  );
}
