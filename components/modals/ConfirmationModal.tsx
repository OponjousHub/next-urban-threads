"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  loadingText?: string;
  action: string;
  title: string;
  description?: string;
  variant?: "danger" | "success" | "warning" | "primary";
  icon?: ReactNode;
  children?: ReactNode;
};

export default function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  loading = false,
  loadingText = "Processing...",
  action,
  title,
  description,
  variant = "danger",
  icon,
  children,
}: Props) {
  const buttonStyles = {
    danger: "bg-red-600 hover:bg-red-700",

    success: "bg-green-600 hover:bg-green-700",

    warning: "bg-yellow-500 hover:bg-yellow-600",

    primary: "bg-blue-600 hover:bg-blue-700",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}

          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            {/* MODAL */}

            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
            >
              <div
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                  {icon && (
                    <div className="mb-4 flex justify-center text-4xl">
                      {icon}
                    </div>
                  )}

                  <h2 className="text-xl font-semibold text-gray-900">
                    {title}
                  </h2>

                  {description && (
                    <p className="mt-2 text-sm text-gray-600">{description}</p>
                  )}

                  {children && <div className="mt-5">{children}</div>}

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={onClose}
                      disabled={loading}
                      className="rounded-md border border-gray-300 px-4 py-2 transition hover:bg-gray-100"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={onConfirm}
                      disabled={loading}
                      className={`rounded-md px-4 py-2 text-white transition disabled:opacity-60 ${buttonStyles[variant]}`}
                    >
                      {loading ? loadingText : action}
                    </button>
                  </div>
                </div>{" "}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
