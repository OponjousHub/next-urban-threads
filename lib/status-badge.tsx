export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    REQUESTED: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-blue-100 text-blue-700",
    REJECTED: "bg-red-100 text-red-700",
    REFUNDED: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        styles[status] || "bg-gray-100"
      }`}
    >
      {status}
    </span>
  );
}
