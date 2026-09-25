"use client";

import { useEffect, useState } from "react";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";
import {
  FiPlus,
  FiShield,
  FiMail,
  FiPhone,
  FiUser,
  FiCalendar,
  FiX,
  FiTrash2,
  FiAlertTriangle,
  FiGlobe,
} from "react-icons/fi";
import { Country } from "country-state-city";
import { appToast } from "@/utils/appToast";

type Administrator = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  role: string;
  status: string;
  createdAt: string;
  tenantId: string;
};

type AdminForm = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  country: string;
};

const initialForm: AdminForm = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  country: "Nigeria",
};

export default function AdministratorsPage() {
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<AdminForm>(initialForm);
  const [currentUserRole, setCurrentUserRole] = useState<
    "OWNER" | "ADMIN" | null
  >(null);

  // ---------------------------------------------------------
  // Delete state
  // ---------------------------------------------------------

  const [deleteModal, setDeleteModal] = useState<Administrator | null>(null);
  const [deleting, setDeleting] = useState(false);
  const countries = Country.getAllCountries();
  // ---------------------------------------------------------
  // Load administrators
  // ---------------------------------------------------------

  async function loadAdministrators() {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/administrators", {
        cache: "no-store",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        appToast.error(
          "Unable to load administrators",
          data?.message || "Something went wrong.",
        );
        return;
      }

      // GET /api/admin/administrator returns the array directly
      setAdministrators(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("LOAD ADMINISTRATORS ERROR:", error);

      appToast.error(
        "Unable to load administrators",
        "Something went wrong while loading administrators.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdministrators();
  }, []);

  // ---------------------------------------------------------
  // Form helpers
  // ---------------------------------------------------------

  function updateField(field: keyof AdminForm, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function openModal() {
    setForm(initialForm);
    setShowModal(true);
  }

  function closeModal() {
    if (submitting) return;

    setShowModal(false);
    setForm(initialForm);
  }

  // ---------------------------------------------------------
  // Create administrator
  // ---------------------------------------------------------

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (submitting) return;

    if (!form.fullName.trim()) {
      appToast.error(
        "Missing name",
        "Please enter the administrator's full name.",
      );
      return;
    }

    if (!form.email.trim()) {
      appToast.error(
        "Missing email",
        "Please enter the administrator's email address.",
      );
      return;
    }

    if (!form.password) {
      appToast.error("Missing password", "Please enter a password.");
      return;
    }

    if (form.password.length < 6) {
      appToast.error(
        "Invalid password",
        "Password must be at least 6 characters.",
      );
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/admin/administrators", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        const firstFieldError =
          data?.errors && Object.values(data.errors).flat()?.[0];

        appToast.error(
          "Administrator creation failed",
          firstFieldError || data?.message || "Unable to create administrator.",
        );

        return;
      }

      appToast.success(
        "Administrator created",
        `${data?.admin?.name || "Administrator"} was added successfully.`,
      );

      setShowModal(false);
      setForm(initialForm);

      await loadAdministrators();
    } catch (error) {
      console.error("CREATE ADMINISTRATOR ERROR:", error);

      appToast.error(
        "Administrator creation failed",
        "Something went wrong while creating the administrator.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ---------------------------------------------------------
  // Delete administrator
  // ---------------------------------------------------------

  function openDeleteModal(admin: Administrator) {
    // Extra frontend protection.
    // The API must ALSO enforce this rule.
    if (admin.role === "OWNER") {
      appToast.error(
        "Owner cannot be deleted",
        "The store owner cannot be removed from the administrator list.",
      );
      return;
    }

    setDeleteModal(admin);
  }

  function closeDeleteModal() {
    if (deleting) return;

    setDeleteModal(null);
  }

  async function handleDeleteAdministrator() {
    if (!deleteModal || deleting) return;

    // Never allow the owner to be deleted from the UI.
    if (deleteModal.role === "OWNER") {
      appToast.error(
        "Owner cannot be deleted",
        "The store owner cannot be removed.",
      );
      return;
    }

    try {
      setDeleting(true);

      const res = await fetch(`/api/admin/administrators/${deleteModal.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        appToast.error(
          "Deletion failed",
          data?.message || "Unable to delete administrator.",
        );
        return;
      }

      appToast.success(
        "Administrator deleted",
        `${deleteModal.name || "Administrator"} was removed successfully.`,
      );

      setDeleteModal(null);

      await loadAdministrators();
    } catch (error) {
      console.error("DELETE ADMINISTRATOR ERROR:", error);

      appToast.error(
        "Deletion failed",
        "Something went wrong while deleting the administrator.",
      );
    } finally {
      setDeleting(false);
    }
  }

  // ---------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <>
      <AdminHeaderUI
        title="Administrators"
        subtitle="Manage the administrators who have access to your store."
        // admin={admin}
      />

      <div className="space-y-6">
        {/* ----------------------------------------------------- */}
        {/* Header */}
        {/* ----------------------------------------------------- */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-end pr-4">
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            <FiPlus className="h-4 w-4" />
            Add Administrator
          </button>
        </div>

        {/* ----------------------------------------------------- */}
        {/* Administrator count */}
        {/* ----------------------------------------------------- */}

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
              <FiShield className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Total Administrators
              </p>

              <p className="mt-1 text-xl font-semibold text-gray-900">
                {loading ? "—" : administrators.length}
              </p>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------- */}
        {/* Administrators table */}
        {/* ----------------------------------------------------- */}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {loading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-xl bg-gray-100"
                />
              ))}
            </div>
          ) : administrators.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <FiShield className="h-6 w-6" />
              </div>

              <h2 className="mt-5 text-base font-semibold text-gray-800">
                No administrators yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Add another administrator to help manage your store.
              </p>

              <button
                type="button"
                onClick={openModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
              >
                <FiPlus className="h-4 w-4" />
                Add Administrator
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Administrator
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Contact
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Role
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Created
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {administrators.map((admin) => {
                    const isOwner = admin.role === "OWNER";

                    return (
                      <tr
                        key={admin.id}
                        className="transition hover:bg-gray-50/70"
                      >
                        {/* Administrator */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                              <FiUser className="h-4 w-4" />
                            </div>

                            <div>
                              <p className="font-medium text-gray-900">
                                {admin.name || "Unnamed Administrator"}
                              </p>

                              <p className="mt-0.5 text-xs text-gray-400">
                                {admin.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}

                        <td className="px-6 py-5">
                          <div className="space-y-1.5 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <FiMail className="h-3.5 w-3.5 text-gray-400" />
                              <span>{admin.email}</span>
                            </div>

                            {admin.phone && (
                              <div className="flex items-center gap-2 text-gray-500">
                                <FiPhone className="h-3.5 w-3.5 text-gray-400" />
                                <span>{admin.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Role */}

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                              isOwner
                                ? "bg-amber-50 text-amber-700"
                                : "bg-purple-50 text-purple-700"
                            }`}
                          >
                            {isOwner ? "Owner" : "Administrator"}
                          </span>
                        </td>

                        {/* Status */}

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                              admin.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {admin.status === "ACTIVE"
                              ? "Active"
                              : admin.status}
                          </span>
                        </td>

                        {/* Created */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <FiCalendar className="h-3.5 w-3.5 text-gray-400" />
                            {formatDate(admin.createdAt)}
                          </div>
                        </td>

                        {/* Action */}

                        <td className="px-6 py-5 text-right">
                          {isOwner ? (
                            <span className="text-xs text-gray-400">
                              Protected
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openDeleteModal(admin)}
                              className="inline-flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100 hover:text-red-700"
                            >
                              <FiTrash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ----------------------------------------------------- */}
        {/* Add Administrator Modal */}
        {/* ----------------------------------------------------- */}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
              {/* Modal header */}

              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Add Administrator
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Create an administrator account with access to this store.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              {/* Modal body */}

              <form
                onSubmit={handleSubmit}
                className="max-h-[calc(100vh-180px)] overflow-y-auto"
              >
                <div className="space-y-5 px-6 py-6">
                  {/* Full name */}

                  <div>
                    <label
                      htmlFor="admin-full-name"
                      className="text-sm font-medium text-gray-800"
                    >
                      Full Name
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      id="admin-full-name"
                      type="text"
                      value={form.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      placeholder="Enter full name"
                      autoComplete="name"
                      disabled={submitting}
                      className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20 disabled:bg-gray-50"
                    />
                  </div>

                  {/* Email */}

                  <div>
                    <label
                      htmlFor="admin-email"
                      className="text-sm font-medium text-gray-800"
                    >
                      Email Address
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      id="admin-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="admin@example.com"
                      autoComplete="email"
                      disabled={submitting}
                      className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20 disabled:bg-gray-50"
                    />
                  </div>

                  {/* Password */}

                  <div>
                    <label
                      htmlFor="admin-password"
                      className="text-sm font-medium text-gray-800"
                    >
                      Password
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      id="admin-password"
                      type="password"
                      value={form.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                      disabled={submitting}
                      className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20 disabled:bg-gray-50"
                    />

                    <p className="mt-1.5 text-xs text-gray-400">
                      The administrator can change this password later.
                    </p>
                  </div>

                  {/* Phone */}

                  <div>
                    <label
                      htmlFor="admin-phone"
                      className="text-sm font-medium text-gray-800"
                    >
                      Phone Number
                    </label>

                    <input
                      id="admin-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="Optional"
                      autoComplete="tel"
                      disabled={submitting}
                      className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20 disabled:bg-gray-50"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label
                      htmlFor="admin-country"
                      className="text-sm font-medium text-gray-800"
                    >
                      Country
                    </label>

                    <div className="relative mt-2">
                      <FiGlobe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                      <select
                        id="admin-country"
                        value={form.country}
                        onChange={(e) => updateField("country", e.target.value)}
                        autoComplete="country-name"
                        disabled={submitting}
                        className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-10 py-3 pr-10 text-sm text-gray-800 outline-none transition focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                      >
                        {countries.map((country) => (
                          <option key={country.isoCode} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>

                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        ▼
                      </span>
                    </div>
                  </div>
                </div>

                {/* Modal footer */}

                <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={submitting}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    {submitting
                      ? "Creating Administrator..."
                      : "Create Administrator"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------- */}
        {/* Delete Administrator Confirmation Modal */}
        {/* ----------------------------------------------------- */}

        {deleteModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 py-6">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
              {/* Delete modal header */}

              <div className="flex items-start gap-4 px-6 pt-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <FiAlertTriangle className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Delete Administrator?
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    You are about to remove this administrator's access to the
                    store.
                  </p>
                </div>
              </div>

              {/* Administrator being deleted */}

              <div className="mx-6 mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm">
                    <FiUser className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">
                      {deleteModal.name || "Unnamed Administrator"}
                    </p>

                    <p className="truncate text-sm text-gray-500">
                      {deleteModal.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm leading-6 text-gray-500">
                  This action cannot be undone from the administrator dashboard.
                  The administrator will no longer be able to access the admin
                  area.
                </p>
              </div>

              {/* Delete modal footer */}

              <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAdministrator}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {deleting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="h-4 w-4" />
                      Delete Administrator
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
