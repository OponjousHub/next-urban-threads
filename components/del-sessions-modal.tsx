"use client";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  confirmColor?: "red" | "default";
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DelSessionsModal({
  isOpen,
  title,
  description,
  confirmText,
  confirmColor = "default",
  onConfirm,
  onCancel,
  
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl">
        <h2 className="text-lg font-semibold">{title}</h2>

        <p className="text-sm text-gray-600">{description}</p>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onCancel}
            className="text-sm px-4 py-2 rounded-lg border"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className={`text-sm px-4 py-2 rounded-lg text-white ${
              confirmColor === "red"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-black hover:bg-gray-800"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
