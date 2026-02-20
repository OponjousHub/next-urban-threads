import { useEffect } from "react";

type Props = {
  open: boolean;
  codes: string[];
  onClose: () => void;
};

export default function RecoveryCodesModal({ open, codes, onClose }: Props) {
  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-[500px] max-w-[95%] rounded-xl p-6 space-y-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Heading */}
        <h2 className="text-xl font-semibold">Backup Recovery Codes</h2>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg text-sm">
          ⚠️ Save these recovery codes in a safe place.
          <br />
          Each code can only be used once.
        </div>

        {/* Codes */}
        <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm grid grid-cols-2 gap-2">
          {codes.map((code) => (
            <div
              key={code}
              className="bg-white px-3 py-2 rounded border text-center"
            >
              {code}
            </div>
          ))}
        </div>

        {/* Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            I have saved these codes
          </button>
        </div>
      </div>
    </div>
  );
}
