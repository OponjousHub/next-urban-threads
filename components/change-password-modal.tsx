"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  onClose: () => void;
}

export default function ChangePasswordModal({ onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const getStrength = () => {
    const pwd = form.newPassword;
    if (pwd.length > 10 && /[A-Z]/.test(pwd) && /\d/.test(pwd)) {
      return "Strong";
    }
    if (pwd.length >= 6) return "Medium";
    return "Weak";
  };
  const strength = getStrength();

  const getErrors = () => {
    const errors: Partial<typeof form> = {};

    if (!form.currentPassword) {
      errors.currentPassword = "Enter current password";
    }

    if (!form.newPassword) {
      errors.newPassword = "Enter new password";
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = "Confirm your password";
    }

    if (
      form.newPassword &&
      form.confirmPassword &&
      form.newPassword !== form.confirmPassword
    ) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };
  const errors = getErrors();
  const hasErrors = Object.keys(errors).length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (hasErrors) return;

      setLoading(true);

      const res = await fetch("/api/users/change-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(`${data.message}`, {
          duration: 8000,
          style: {
            border: "1px solid #4f46e5",
            padding: "12px",
            color: "#333",
          },
          iconTheme: {
            primary: "#4f46e5",
            secondary: "#fff",
          },
        });
        return;
      }

      toast.success("Password updated successfully", {
        duration: 8000,
        style: {
          border: "1px solid #4f46e5",
          padding: "12px",
          color: "#333",
        },
        iconTheme: {
          primary: "#4f46e5",
          secondary: "#fff",
        },
      });
      onClose();
    } catch (err) {
      toast.error("Something went wrong", {
        duration: 8000,
        style: {
          border: "1px solid #4f46e5",
          padding: "12px",
          color: "#333",
        },
        iconTheme: {
          primary: "#4f46e5",
          secondary: "#fff",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-[420px] space-y-4">
        <h2 className="text-lg font-semibold">Change Password</h2>

        {/* Current Password */}
        <PasswordInput
          label="Current Password"
          name="currentPassword"
          value={form.currentPassword}
          show={show.current}
          toggle={() => setShow({ ...show, current: !show.current })}
          onChange={handleChange}
          onBlur={() => setTouched({ ...touched, currentPassword: true })}
          error={errors.currentPassword}
          touched={touched.currentPassword}
        />

        {/* New Password */}
        <PasswordInput
          label="New Password"
          name="newPassword"
          value={form.newPassword}
          show={show.new}
          toggle={() => setShow({ ...show, new: !show.new })}
          onChange={handleChange}
          onBlur={() => setTouched({ ...touched, newPassword: true })}
          error={errors.newPassword}
          touched={touched.newPassword}
        />

        {/* Strength */}
        <p
          className={`text-sm ${
            strength === "Strong"
              ? "text-green-600"
              : strength === "Medium"
                ? "text-yellow-600"
                : "text-red-600"
          }`}
        >
          Password Strength: {strength}
        </p>

        {/* Confirm */}
        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          value={form.confirmPassword}
          show={show.confirm}
          toggle={() => setShow({ ...show, confirm: !show.confirm })}
          onChange={handleChange}
          onBlur={() => setTouched({ ...touched, confirmPassword: true })}
          error={errors.confirmPassword}
          touched={touched.confirmPassword}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={hasErrors || loading}
            className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface InputProps {
  label: string;
  name: keyof ChangePasswordForm;
  value: string;
  show: boolean;
  toggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  error?: string;
  touched?: boolean;
}

type ChangePasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

function PasswordInput({
  label,
  name,
  value,
  show,
  toggle,
  onChange,
  onBlur,
  error,
  touched,
}: InputProps) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>

      <div className="relative mt-1">
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full border rounded-lg px-3 py-2 pr-10 ${
            touched && error ? "border-red-500" : ""
          }`}
        />

        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-2 text-sm"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>

      {touched && error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
