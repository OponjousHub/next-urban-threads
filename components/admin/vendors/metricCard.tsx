type MetricCardProps = {
  label: string;
  value: number;
};

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="text-sm text-muted-foreground">{label}</div>

      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}
