"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/lib/status-badge";
import { FaChevronRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { MetricCard } from "./metricCard";

type VendorApplication = {
  id: string;
  user: { id: string; name: string; email: string };
  businessName: String;
  businessEmail?: String;
  businessPhone?: String;
  description?: String;
  status: string;
  createdAt: string;
};

export default function VendorAprovalPage() {
  const [vendors, setVendors] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalApplications: 0,
  });
  const router = useRouter();

  const cards = [
    {
      label: "Pending Applications",
      value: metrics.pendingApplications,
      border: "border-yellow-200",
    },
    {
      label: "Approved Vendors",
      value: metrics.approvedApplications,
      border: "border-green-200",
    },
    {
      label: "Rejected Applications",
      value: metrics.rejectedApplications,
      border: "border-red-200",
    },
    {
      label: "Total Applications",
      value: metrics.totalApplications,
      border: "border-blue-200",
    },
  ];

  useEffect(() => {
    fetchVendors();
    fetchMetrics();
  }, []);

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

  if (loading) {
    return <p className="p-6">Loading vendors applications...</p>;
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Vendor applications</h1>

      <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border bg-white p-5 shadow-sm ${card.border}`}
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>

            <h2 className="mt-2 text-3xl font-bold">{card.value}</h2>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
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
            {vendors.map((r) => {
              return (
                // <Link key={r.id} href={`/admin/vendors/${r.id}`}>
                <tr
                  key={r.id}
                  onClick={() => router.push(`/admin/vendors/${r.id}`)}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                >
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
                  <td className=" align-middle ">
                    <FaChevronRight size={8} className="align-middle" />
                  </td>
                </tr>
                // </Link>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
