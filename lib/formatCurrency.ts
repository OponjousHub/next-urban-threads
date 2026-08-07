export function formatCurrency(
  value: number,
  currency: string = "NGN",
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    ...options,
  }).format(Number(value) || 0);
}
