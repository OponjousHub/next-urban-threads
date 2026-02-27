"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRatingInput } from "./starRatingInput";
import { toastError, toastSuccess } from "@/utils/toast-notification";

interface Props {
  productId: string;
}

export function ReviewForm({ productId }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!rating) {
      toastError("Please select a rating");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          rating,
          comment,
          productId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toastError(data.message || "Failed to submit review");
        return;
      }

      toastSuccess("Review submitted successfully!");
      setRating(0);
      setComment("");
    } catch (error) {
      toastError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded-2xl p-6 space-y-4">
      <h3 className="text-lg font-semibold">Write a Review</h3>

      <StarRatingInput value={rating} onChange={setRating} />

      <Textarea
        placeholder="Share your experience..."
        value={comment}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setComment(e.target.value)
        }
      />

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Submitting..." : "Submit Review"}
      </Button>
    </div>
  );
}
