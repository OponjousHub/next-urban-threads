function MetricCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <p className="text-sm text-muted-foreground">{title}</p>

      <h2 className="mt-2 text-3xl font-bold">{value}</h2>
    </div>
  );
}
