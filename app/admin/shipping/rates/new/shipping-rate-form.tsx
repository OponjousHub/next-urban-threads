"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { appToast } from "@/utils/appToast";

type Zone = {
  id: string;
  name: string;
};

type Method = {
  id: string;
  name: string;
  zoneId: string;
};

type InitialData = {
  id: string;
  zoneId: string;
  methodId: string;

  name: string;
  description: string | null;

  amount: number;

  minOrderAmount: number | null;
  maxOrderAmount: number | null;

  minWeight: number | null;
  maxWeight: number | null;

  priority: number;

  active: boolean;
  isDefault: boolean;
};

type Props = {
  zones: Zone[];
  methods: Method[];
  initialData?: InitialData;
};

export default function ShippingRateForm({
  zones,
  methods,
  initialData,
}: Props) {
  const router = useRouter();

  const editing = !!initialData;

  const [zoneId, setZoneId] = useState(initialData?.zoneId ?? "");

  const [methodId, setMethodId] = useState(initialData?.methodId ?? "");

  const [name, setName] = useState(initialData?.name ?? "");

  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );

  const [amount, setAmount] = useState(initialData?.amount?.toString() ?? "");

  const [minOrderAmount, setMinOrderAmount] = useState(
    initialData?.minOrderAmount?.toString() ?? "",
  );

  const [maxOrderAmount, setMaxOrderAmount] = useState(
    initialData?.maxOrderAmount?.toString() ?? "",
  );

  const [minWeight, setMinWeight] = useState(
    initialData?.minWeight?.toString() ?? "",
  );

  const [maxWeight, setMaxWeight] = useState(
    initialData?.maxWeight?.toString() ?? "",
  );

  const [priority, setPriority] = useState(
    initialData?.priority?.toString() ?? "1",
  );

  const [active, setActive] = useState(initialData?.active ?? true);

  const [isDefault, setIsDefault] = useState(initialData?.isDefault ?? false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const availableMethods = useMemo(() => {
    return methods.filter((m) => m.zoneId === zoneId);
  }, [methods, zoneId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (!zoneId) {
      setError("Please select a shipping zone.");
      return;
    }

    if (!methodId) {
      setError("Please select a shipping method.");
      return;
    }

    if (!name.trim()) {
      setError("Rate name is required.");
      return;
    }

    if (!amount) {
      setError("Shipping amount is required.");
      return;
    }

    try {
      setLoading(true);

      const body = {
        zoneId,
        methodId,

        name,
        description,

        amount: Number(amount),

        minOrderAmount: minOrderAmount === "" ? null : Number(minOrderAmount),

        maxOrderAmount: maxOrderAmount === "" ? null : Number(maxOrderAmount),

        minWeight: minWeight === "" ? null : Number(minWeight),

        maxWeight: maxWeight === "" ? null : Number(maxWeight),

        priority: Number(priority),

        active,
        isDefault,
      };

      const response = await fetch(
        editing
          ? `/api/admin/shipping/rates/${initialData!.id}`
          : "/api/admin/shipping/rates",
        {
          method: editing ? "PATCH" : "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        const data = await response.json();

        throw new Error(data.message ?? "Unable to save shipping rate.");
      }

      appToast.success(
        "Success",
        editing
          ? "Shipping rate updated successfully."
          : "Shipping rate created successfully.",
      );

      router.push("/admin/shipping/rates");

      router.refresh();
    } catch (err: any) {
      setError(err.message);
      appToast.error("Error", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold">Shipping Rate</h2>

          <p className="mt-1 text-sm text-gray-500">
            Configure pricing and conditions.
          </p>
        </div>

        <div className="space-y-6 p-6">
          {/* Zone */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Shipping Zone
            </label>

            <select
              value={zoneId}
              onChange={(e) => {
                setZoneId(e.target.value);
                setMethodId("");
              }}
              className="w-full rounded-xl border px-4 py-3"
            >
              <option value="">Select shipping zone</option>

              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>

          {/* Method */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Shipping Method
            </label>

            <select
              value={methodId}
              onChange={(e) => setMethodId(e.target.value)}
              className="w-full rounded-xl border px-4 py-3"
            >
              <option value="">Select shipping method</option>

              {availableMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}

          <div>
            <label className="mb-2 block text-sm font-medium">Rate Name</label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border px-4 py-3"
              placeholder="Standard Shipping"
            />
          </div>

          {/* Description */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          {/* Amount */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Shipping Cost
            </label>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          {/* Order Amount */}

          <div className="grid md:grid-cols-2 gap-5">
            <input
              type="number"
              placeholder="Minimum Order Amount"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
              className="rounded-xl border px-4 py-3"
            />

            <input
              type="number"
              placeholder="Maximum Order Amount"
              value={maxOrderAmount}
              onChange={(e) => setMaxOrderAmount(e.target.value)}
              className="rounded-xl border px-4 py-3"
            />
          </div>

          {/* Weight */}

          <div className="grid md:grid-cols-2 gap-5">
            <input
              type="number"
              placeholder="Minimum Weight (kg)"
              value={minWeight}
              onChange={(e) => setMinWeight(e.target.value)}
              className="rounded-xl border px-4 py-3"
            />

            <input
              type="number"
              placeholder="Maximum Weight (kg)"
              value={maxWeight}
              onChange={(e) => setMaxWeight(e.target.value)}
              className="rounded-xl border px-4 py-3"
            />
          </div>

          {/* Priority */}

          <div>
            <label className="mb-2 block text-sm font-medium">Priority</label>

            <input
              type="number"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          {/* Toggles */}

          <div className="space-y-4">
            <label className="flex items-center justify-between rounded-xl border p-4">
              <span>Default Rate</span>

              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border p-4">
              <span>Active</span>

              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
            </label>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href="/admin/shipping/rates"
          className="rounded-xl border px-5 py-3"
        >
          <ArrowLeft className="inline h-4 w-4 mr-2" />
          Cancel
        </Link>

        <button
          disabled={loading}
          className="rounded-xl bg-black px-6 py-3 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="inline h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="inline h-4 w-4 mr-2" />
              {editing ? "Update Rate" : "Create Rate"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
