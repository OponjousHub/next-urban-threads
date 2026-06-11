export function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="text-sm text-muted-foreground">{label}</div>

      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}
