"use client";

import { useState } from "react";

interface Props {
  onClose: () => void;
}

export default function ChangePasswordModal({ onClose }: Props) {
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

  const getStrength = () => {
    const pwd = form.newPassword;
    if (pwd.length > 10 && /[A-Z]/.test(pwd) && /\d/.test(pwd)) {
      return "Strong";
    }
    if (pwd.length >= 6) return "Medium";
    return "Weak";
  };

  const strength = getStrength();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
        />

        {/* New Password */}
        <PasswordInput
          label="New Password"
          name="newPassword"
          value={form.newPassword}
          show={show.new}
          toggle={() => setShow({ ...show, new: !show.new })}
          onChange={handleChange}
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
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>

          <button className="px-4 py-2 bg-black text-white rounded-lg">
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}

interface InputProps {
  label: string;
  name: string;
  value: string;
  show: boolean;
  toggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function PasswordInput({
  label,
  name,
  value,
  show,
  toggle,
  onChange,
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
          className="w-full border rounded-lg px-3 py-2 pr-10"
        />

        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-2 text-sm"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
