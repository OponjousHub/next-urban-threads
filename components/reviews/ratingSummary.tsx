import { Star } from "lucide-react";

interface Props {
  average: number;
  count: number;
}

export function RatingSummary({ average, count }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-3xl font-bold">{average.toFixed(1)}</div>

      <div className="flex items-center gap-1">
        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        <span className="text-sm text-muted-foreground">({count} reviews)</span>
      </div>
    </div>
  );
}
