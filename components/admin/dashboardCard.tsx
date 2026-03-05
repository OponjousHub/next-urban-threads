interface Props {
  title: string;
  value: string;
  change: string;
}

export function DashboardCard({ title, value, change }: Props) {
  const isPositive = change.startsWith("+");

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{title}</p>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            isPositive
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {change}
        </span>
      </div>

      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  );
}
