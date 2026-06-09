"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaChevronRight, FaSearch } from "react-icons/fa";
import { StatusBadge } from "@/lib/status-badge";
import { Vendor } from "@/types/vendor";

export default function VendorManagementPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const router = useRouter();

  useEffect(() => {
    fetchVendors();
  }, []);

  async function fetchVendors() {
    try {
      const response = await fetch("/api/admin/vendors/manage");

      const data = await response.json();

      setVendors(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const filteredVendors = vendors.filter((vendor) => {
    const owner = vendor.users[0];

    const matchesSearch =
      vendor.name.toLowerCase().includes(search.toLowerCase()) ||
      owner?.name?.toLowerCase().includes(search.toLowerCase()) ||
      owner?.email?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ? true : vendor.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filters = [
    {
      label: `All (${vendors.length})`,
      value: "ALL",
    },
    {
      label: `Approved (${
        vendors.filter((v) => v.status === "APPROVED").length
      })`,
      value: "APPROVED",
    },
    {
      label: `Pending (${
        vendors.filter((v) => v.status === "PENDING").length
      })`,
      value: "PENDING",
    },
    {
      label: `Suspended (${
        vendors.filter((v) => v.status === "SUSPENDED").length
      })`,
      value: "SUSPENDED",
    },
  ];

  // Toggle selection
  function toggleVendor(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  // Select all
  function toggleSelectAll() {
    if (selectedIds.length === filteredVendors.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredVendors.map((vendor) => vendor.id));
    }
  }

  if (loading) {
    return <div className="p-6">Loading vendors...</div>;
  }

  return (
    <main className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Vendor Management</h1>

      {/* Search + Filters */}

      <div className="mb-6 rounded-xl border bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <input
              type="text"
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border py-2 pl-10 pr-4"
            />

            <FaSearch
              size={14}
              className="absolute left-3 top-3 text-gray-400"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition
                  ${
                    statusFilter === filter.value
                      ? "bg-[var(--color-primary)] text-white"
                      : "border bg-white hover:bg-gray-50"
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="w-12 p-4">
                {/*Checkbox*/}
                <input
                  type="checkbox"
                  checked={
                    filteredVendors.length > 0 &&
                    selectedIds.length === filteredVendors.length
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-4 text-left">Vendor</th>

              <th className="p-4 text-left">Owner</th>

              <th className="p-4 text-left">Products</th>

              <th className="p-4 text-left">Orders</th>

              <th className="p-4 text-left">Status</th>

              <th className="p-4 text-left">Created</th>

              <th className="w-12"></th>
            </tr>
          </thead>
          {selectedIds.length > 0 && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border bg-white p-4">
              <span className="text-sm">{selectedIds.length} selected</span>

              <button
                onClick={bulkSuspend}
                className="rounded-lg bg-red-600 px-4 py-2 text-white"
              >
                Suspend
              </button>

              <button
                onClick={bulkActivate}
                className="rounded-lg bg-green-600 px-4 py-2 text-white"
              >
                Activate
              </button>
            </div>
          )}

          <tbody>
            {filteredVendors.map((vendor) => {
              const owner = vendor.users[0];

              return (
                <tr
                  key={vendor.id}
                  onClick={() =>
                    router.push(`/admin/vendors/manage/${vendor.id}`)
                  }
                  className="cursor-pointer border-t hover:bg-gray-50"
                >
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(vendor.id)}
                      onChange={() => toggleVendor(vendor.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{vendor.name}</div>

                      <div className="text-xs text-muted-foreground">
                        {vendor.slug}
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div>
                      <div>{owner?.name || "—"}</div>

                      <div className="text-xs text-muted-foreground">
                        {owner?.email}
                      </div>
                    </div>
                  </td>

                  <td className="p-4">{vendor._count.products}</td>

                  <td className="p-4">{vendor._count.orders}</td>

                  <td className="p-4">
                    <StatusBadge status={vendor.status} />
                  </td>

                  <td className="p-4">
                    {new Date(vendor.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-4 text-center">
                    <FaChevronRight
                      size={10}
                      className="mx-auto text-gray-400"
                    />
                  </td>
                </tr>
              );
            })}

            {filteredVendors.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center text-muted-foreground"
                >
                  No vendors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
