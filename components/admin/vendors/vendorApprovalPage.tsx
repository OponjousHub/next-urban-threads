"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/lib/status-badge";
import { FaChevronRight, FaSearch, FaChevronLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { appToast } from "@/utils/appToast";

type VendorApplication = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  businessName: string;
  businessEmail?: string;
  businessPhone?: string;
  description?: string;
  status: string;
  createdAt: string;
};

export default function VendorAprovalPage() {
  const [vendors, setVendors] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkApproving, setBulkApproving] = useState(false);
  const [bulkRejecting, setBulkRejecting] = useState(false);
  const [metrics, setMetrics] = useState({
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalApplications: 0,
  });
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchVendors();
    fetchMetrics();
  }, []);

  // Reset Page When Filters Change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortBy]);

  async function fetchMetrics() {
    try {
      const res = await fetch("/api/admin/vendors/application/metrics");

      const data = await res.json();

      setMetrics(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchVendors() {
    try {
      const res = await fetch("/api/admin/vendors/application");
      const data = await res.json();
      setVendors(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredVendors = vendors
    .filter((vendor) => {
      const searchTerm = search.toLowerCase();

      const matchesSearch =
        vendor.businessName?.toLowerCase().includes(searchTerm) ||
        vendor.businessEmail?.toLowerCase().includes(searchTerm) ||
        vendor.businessPhone?.toLowerCase().includes(searchTerm) ||
        vendor.user.name?.toLowerCase().includes(searchTerm) ||
        vendor.user.email?.toLowerCase().includes(searchTerm);

      const matchesStatus =
        statusFilter === "ALL" ? true : vendor.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

        case "business-asc":
          return a.businessName.localeCompare(b.businessName);

        case "business-desc":
          return b.businessName.localeCompare(a.businessName);

        case "applicant-asc":
          return a.user.name.localeCompare(b.user.name);

        case "applicant-desc":
          return b.user.name.localeCompare(a.user.name);

        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

  const filters = [
    {
      label: `All (${metrics.totalApplications})`,
      value: "ALL",
    },
    {
      label: `Pending (${metrics.pendingApplications})`,
      value: "PENDING",
    },
    {
      label: `Approved (${metrics.approvedApplications})`,
      value: "APPROVED",
    },
    {
      label: `Rejected (${metrics.rejectedApplications})`,
      value: "REJECTED",
    },
  ];

  // Process Pagination
  const totalPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE);

  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Select/Deselect Single Row
  function toggleSelection(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  // Select All
  function toggleSelectAll() {
    if (selectedIds.length === paginatedVendors.length) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(paginatedVendors.map((vendor) => vendor.id));
  }

  // Bulk Approve
  async function bulkApprove() {
    try {
      setBulkApproving(true);

      const response = await fetch(
        "/api/admin/vendors/application/bulk-approve",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ids: selectedIds,
          }),
        },
      );
      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.message || "Request failed");
      }

      appToast.success(
        "Success",
        "Selected application(s) approved successfully",
      );

      setSelectedIds([]);

      fetchVendors();
      fetchMetrics();
    } catch (error: any) {
      appToast.error("Failed", error.message || "Something went wrong");
      console.error(error);
    } finally {
      setBulkApproving(false);
    }
  }

  // Bulk Reject
  async function bulkReject() {
    try {
      setBulkRejecting(true);

      const response = await fetch(
        "/api/admin/vendors/application/bulk-reject",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ids: selectedIds,
          }),
        },
      );
      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.message || "Request failed");
      }

      appToast.success("Success", "Selected application(s) rejected");

      setSelectedIds([]);

      fetchVendors();
      fetchMetrics();
    } catch (error: any) {
      appToast.error("Failed", error.message || "Something went wrong");
      console.error(error);
    } finally {
      setBulkRejecting(false);
    }
  }

  // COMPUTING COUNTS
  const selectedApplications = paginatedVendors.filter((app) =>
    selectedIds.includes(app.id),
  );

  // Show buttons only when application is pending
  const actionableApplications = selectedApplications.filter(
    (app) => app.status === "PENDING",
  );

  if (loading) {
    return <p className="p-6">Loading vendors applications...</p>;
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Vendor applications</h1>

      <div className="mb-6 rounded-xl border bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative w-full lg:max-w-sm">
            <input
              type="text"
              placeholder="Search business name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border pl-10 pr-4 py-2"
            />

            <FaSearch
              className="absolute left-3 top-3 text-gray-400"
              size={14}
            />
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Sort</label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="business-asc">Business A-Z</option>
              <option value="business-desc">Business Z-A</option>
              <option value="applicant-asc">Applicant A-Z</option>
              <option value="applicant-desc">Applicant Z-A</option>
            </select>
          </div>

          {/* Status Filters */}
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

      <div className="bg-white border rounded-xl overflow-hidden">
        {/*Bulk Toolbar, only when something is selected*/}
        {selectedIds.length > 0 && (
          <div className="mb-4 flex items-center justify-between rounded-xl border bg-blue-50 px-4 py-3">
            <div className="font-medium">{selectedIds.length} selected</div>

            {actionableApplications.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={bulkApprove}
                  disabled={bulkApproving || selectedIds.length === 0}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkApproving && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}

                  {bulkApproving ? "Approving..." : "Approve Selected"}
                </button>

                <button
                  onClick={bulkReject}
                  disabled={bulkRejecting || selectedIds.length === 0}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkRejecting && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}

                  {bulkRejecting ? "Rejecting..." : "Reject Selected"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Application table*/}
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              {/*Checkbox Column*/}
              <th className="w-12 p-3">
                <input
                  type="checkbox"
                  checked={
                    paginatedVendors.length > 0 &&
                    selectedIds.length === paginatedVendors.length
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-3 text-left">Applicant</th>
              <th className="p-3 text-left">Business name</th>
              <th className="p-3 text-left">Business email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedVendors.map((r) => {
              return (
                <tr
                  key={r.id}
                  onClick={() => router.push(`/admin/vendors/${r.id}`)}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                >
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(r.id)}
                      onChange={() => toggleSelection(r.id)}
                    />
                  </td>
                  <td className="p-3">{r.user.name}</td>
                  <td className="p-3">{r.businessName}</td>
                  <td className="p-3">{r.businessEmail}</td>
                  <td className="p-3">{r.businessPhone}</td>
                  <td className="p-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="p-3">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="w-12">
                    <div className="flex items-center justify-center">
                      <FaChevronRight
                        size={12}
                        className="text-gray-400 transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </div>
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
                  No applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
        {/* Results Info */}
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {Math.min(
              (currentPage - 1) * ITEMS_PER_PAGE + 1,
              filteredVendors.length,
            )}
          </span>
          -
          <span className="font-medium text-foreground">
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredVendors.length)}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground">
            {filteredVendors.length}
          </span>{" "}
          vendors
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="
        inline-flex items-center gap-2
        rounded-lg border bg-white px-3 py-2
        text-sm font-medium
        shadow-sm transition
        hover:bg-gray-50
        disabled:pointer-events-none
        disabled:opacity-40
      "
          >
            <FaChevronLeft size={10} />
            Previous
          </button>

          <div className="flex h-10 min-w-[80px] items-center justify-center rounded-lg border bg-white px-4 text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="
        inline-flex items-center gap-2
        rounded-lg border bg-white px-3 py-2
        text-sm font-medium
        shadow-sm transition
        hover:bg-gray-50
        disabled:pointer-events-none
        disabled:opacity-40
      "
          >
            Next
            <FaChevronRight size={10} />
          </button>
        </div>
      </div>
    </main>
  );
}
