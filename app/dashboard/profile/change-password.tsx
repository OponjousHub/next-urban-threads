"use client";

import { useState } from "react";

export default function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (form.newPassword !== form.confirmPassword) {
      return setMessage("Passwords do not match");
    }

    try {
      setLoading(true);

      const res = await fetch("/api/user/change-password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      setMessage(data.message);
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-md">
      <input
        type="password"
        name="currentPassword"
        placeholder="Current Password"
        onChange={handleChange}
        className="border p-2 w-full"
      />

      <input
        type="password"
        name="newPassword"
        placeholder="New Password"
        onChange={handleChange}
        className="border p-2 w-full"
      />

      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        onChange={handleChange}
        className="border p-2 w-full"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-black text-white px-4 py-2"
      >
        {loading ? "Updating..." : "Change Password"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
