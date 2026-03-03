"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRatingInput } from "./starRatingInput";
import { toastError, toastSuccess } from "@/utils/toast-notification";
import { useRouter } from "next/navigation";
import { DialogClose } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { updateProductRating } from "@/lib/calProduct-rating";

interface Props {
  productId: string;
  onSuccess?: () => void;
  existingReview?: {
    id: string;
    rating: number;
    comment: string;
  } | null;
}

export function ReviewForm({ productId, existingReview, onSuccess }: Props) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [loading, setLoading] = useState(false);
  const [existReview, setExistReview] = useState(existingReview);
  const router = useRouter();

  useEffect(() => {
    setExistReview(existingReview);
    setRating(existingReview?.rating ?? 0);
    setComment(existingReview?.comment ?? "");
  }, [existingReview]);

  async function handleSubmit() {
    if (!rating) {
      toastError("Please select a rating");
      return;
    }

    try {
      setLoading(true);

      const isEditing = !!existReview;

      const res = await fetch(
        `/api/reviews/${isEditing ? "update" : "create"}`,
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating,
            comment,
            productId,
            reviewId: existReview?.id,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        toastError(data.message || "Failed to submit review");
        return;
      }

      setExistReview(data.review ?? data);

      toastSuccess(
        isEditing
          ? "Review updated successfully"
          : "Review submitted successfully",
      );

      updateProductRating(productId);
      setRating(0);
      setComment("");
      router.refresh();
      onSuccess?.();
    } catch {
      toastError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative p-6 space-y-6">
      {/* Improved Close Button */}
      <DialogClose asChild>
        <button
          className="absolute right-4 top-4 
             h-11 w-11 flex items-center justify-center 
             rounded-full bg-gray-100 
             hover:bg-red-100 group
             transition active:scale-95"
        >
          <X className="h-5 w-5 text-gray-600 group-hover:text-red-600 transition" />
        </button>
      </DialogClose>

      <h3 className="text-xl font-semibold">
        {existReview ? "Update Review" : "Write a Review"}
      </h3>

      <StarRatingInput value={rating} onChange={setRating} />

      <Textarea
        placeholder="Share your experience..."
        value={comment}
        className="min-h-[120px]"
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setComment(e.target.value)
        }
      />

      <div className="flex gap-3 justify-end">
        {/* Cancel Button */}
        <DialogClose asChild>
          <Button
            variant="outline"
            disabled={loading}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
        </DialogClose>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="min-w-[140px]"
        >
          {loading
            ? existReview
              ? "Updating..."
              : "Submitting..."
            : existReview
              ? "Update Review"
              : "Submit Review"}
        </Button>
      </div>
    </div>
  );
}
