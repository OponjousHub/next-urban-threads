export function ImageUpload({
  label,
  value,
  onChange,
  uploading,
}: {
  label: string;
  value?: string;
  onChange: (file: File) => void;
  uploading: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      <div className="border-2 border-dashed rounded-xl p-4 text-center hover:bg-gray-50 transition">
        {uploading ? (
          <p className="text-sm text-gray-500">Uploading...</p>
        ) : value ? (
          <div className="flex flex-col items-center gap-3">
            <img
              src={value}
              alt={label}
              className="h-20 object-cover rounded-lg border"
            />

            <div className="flex gap-4">
              <label className="cursor-pointer text-sm text-[var(--color-primary)] hover:underline">
                Change
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files?.[0] && onChange(e.target.files[0])
                  }
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => onChange(null as any)}
                className="text-sm text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label className="cursor-pointer block text-sm text-gray-500">
            Click to upload image
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                e.target.files?.[0] && onChange(e.target.files[0])
              }
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
}
