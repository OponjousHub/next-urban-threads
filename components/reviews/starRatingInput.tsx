"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange: (rating: number) => void;
}

export function StarRatingInput({ value, onChange }: Props) {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = hover !== null ? star <= hover : star <= value;

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
            className="transition"
          >
            <Star
              className={cn(
                "h-6 w-6",
                active ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
