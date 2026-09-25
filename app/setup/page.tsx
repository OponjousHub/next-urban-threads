"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { appToast } from "@/utils/appToast";
import { Country } from "country-state-city";
import { FiGlobe } from "react-icons/fi";

type FormData = {
  setupSecret: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  country: string;
};

export default function SetupPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [setupAvailable, setSetupAvailable] = useState(false);

  const [form, setForm] = useState<FormData>({
    setupSecret: "",
    fullName: "",
    email: "",
    password: "",
    phone: "",
    country: "",
  });
  const countries = Country.getAllCountries();
  /*
  |--------------------------------------------------------------------------
  | Check whether initial setup is still available
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    async function checkSetup() {
      try {
        const res = await fetch("/api/setup", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok || !data.setupAvailable) {
          /*
          |--------------------------------------------------------------------------
          | Setup has already been completed.
          |--------------------------------------------------------------------------
          */

          router.replace("/login");

          return;
        }

        setSetupAvailable(true);
      } catch (error) {
        console.error("SETUP CHECK ERROR:", error);

        appToast.error(
          "Setup unavailable",
          "Unable to check store setup status.",
        );
      } finally {
        setLoading(false);
      }
    }

    checkSetup();
  }, [router]);

  /*
  |--------------------------------------------------------------------------
  | Input helper
  |--------------------------------------------------------------------------
  */

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (submitting) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Basic client validation
    |--------------------------------------------------------------------------
    */

    if (!form.setupSecret || !form.fullName || !form.email || !form.password) {
      appToast.error("Incomplete setup", "Please fill in all required fields.");

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

      const res = await fetch("/api/setup", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        appToast.error(
          "Setup failed",
          data?.message || "Unable to complete store setup.",
        );

        /*
        |--------------------------------------------------------------------------
        | If setup has already been completed,
        | don't leave this page available.
        |--------------------------------------------------------------------------
        */

        if (res.status === 409) {
          router.replace("/login");
        }

        return;
      }

      appToast.success(
        "Setup complete",
        "Your administrator account has been created.",
      );

      /*
      |--------------------------------------------------------------------------
      | The API already authenticated the admin.
      |--------------------------------------------------------------------------
      */

      router.replace("/admin");
    } catch (error) {
      console.error("SETUP SUBMIT ERROR:", error);

      appToast.error(
        "Setup failed",
        "Something went wrong while creating the administrator.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="rounded-2xl border bg-white px-8 py-10 text-center shadow-sm">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-black" />

          <p className="text-sm text-gray-500">Checking store setup...</p>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Setup unavailable
  |--------------------------------------------------------------------------
  */

  if (!setupAvailable) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Setup form
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-xl">
        {/* ------------------------------------------------ */}
        {/* Header */}
        {/* ------------------------------------------------ */}

        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-xl font-bold text-white">
            S
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Set up your store
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
            Create the first administrator account for your store. You can
            configure the rest of your store from the admin dashboard.
          </p>
        </div>

        {/* ------------------------------------------------ */}
        {/* Form */}
        {/* ------------------------------------------------ */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm md:p-8"
        >
          {/* ---------------------------------------------- */}
          {/* Setup Secret */}
          {/* ---------------------------------------------- */}

          <div>
            <label
              htmlFor="setupSecret"
              className="text-sm font-medium text-gray-800"
            >
              Setup Secret
            </label>

            <input
              id="setupSecret"
              type="password"
              value={form.setupSecret}
              onChange={(e) => updateField("setupSecret", e.target.value)}
              placeholder="Enter your store setup secret"
              autoComplete="off"
              className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
            />

            <p className="mt-2 text-xs leading-5 text-gray-400">
              This is the private setup secret configured on your server. It is
              required only during initial installation.
            </p>
          </div>

          <div className="border-t" />

          {/* ---------------------------------------------- */}
          {/* Administrator Information */}
          {/* ---------------------------------------------- */}

          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Administrator account
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              This account will have full administrator access to the store.
            </p>
          </div>

          {/* ---------------------------------------------- */}
          {/* Full Name */}
          {/* ---------------------------------------------- */}

          <div>
            <label
              htmlFor="fullName"
              className="text-sm font-medium text-gray-800"
            >
              Full Name
              <span className="text-red-500"> *</span>
            </label>

            <input
              id="fullName"
              type="text"
              value={form.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              placeholder="Your full name"
              autoComplete="name"
              className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          {/* ---------------------------------------------- */}
          {/* Email */}
          {/* ---------------------------------------------- */}

          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-800"
            >
              Email Address
              <span className="text-red-500"> *</span>
            </label>

            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          {/* ---------------------------------------------- */}
          {/* Password */}
          {/* ---------------------------------------------- */}

          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-800"
            >
              Password
              <span className="text-red-500"> *</span>
            </label>

            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          {/* ---------------------------------------------- */}
          {/* Phone */}
          {/* ---------------------------------------------- */}

          <div>
            <label
              htmlFor="phone"
              className="text-sm font-medium text-gray-800"
            >
              Phone Number
            </label>

            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="Optional"
              autoComplete="tel"
              className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>
          {/* ---------------------------------------------- */}
          {/* Country */}
          {/* ---------------------------------------------- */}

          <div>
            <label
              htmlFor="country"
              className="text-sm font-medium text-gray-800"
            >
              Country
              <span className="text-red-500"> *</span>
            </label>

            <div className="relative mt-2 flex items-center rounded-xl border border-gray-200 bg-white px-4 py-3 transition focus-within:border-[var(--color-primary)] focus-within:ring-1 focus-within:ring-[var(--color-primary)]/20">
              <FiGlobe className="mr-3 shrink-0 text-gray-400" />

              <select
                id="country"
                name="country"
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
                disabled={submitting}
                autoComplete="country"
                className="w-full appearance-none border-none bg-transparent pr-8 text-sm text-gray-700 outline-none focus:outline-none disabled:cursor-not-allowed disabled:bg-transparent"
              >
                <option value="">Select Country</option>

                {countries.map((country) => (
                  <option key={country.isoCode} value={country.isoCode}>
                    {country.name}
                  </option>
                ))}
              </select>

              <svg
                className="pointer-events-none absolute right-4 h-4 w-4 text-gray-400"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M6 8l4 4 4-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* ---------------------------------------------- */}
          {/* Submit */}
          {/* ---------------------------------------------- */}

          <button
            type="submit"
            disabled={submitting}
            className={`
              w-full rounded-xl px-5 py-3.5
              text-sm font-medium text-white
              transition
              ${
                submitting
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-[var(--color-primary)] hover:opacity-90"
              }
            `}
          >
            {submitting ? "Creating administrator..." : "Complete Store Setup"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Initial setup is available only before the first administrator account
          is created.
        </p>
      </div>
    </main>
  );
}
