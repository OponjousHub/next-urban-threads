"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { StarRatingInput } from "./starRatingInput";
import { useRouter } from "next/navigation";
import { DialogClose } from "@/components/ui/dialog";
import { appToast } from "@/utils/appToast";

interface Props {
  productId: string;

  onSuccess?: () => void;

  existingReview?: {
    id: string;
    rating: number;
    title?: string | null;
    comment: string;
  } | null;
}

export function ReviewForm({ productId, existingReview, onSuccess }: Props) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);

  const [title, setTitle] = useState(existingReview?.title ?? "");

  const [comment, setComment] = useState(existingReview?.comment ?? "");

  const [loading, setLoading] = useState(false);

  const [existReview, setExistReview] = useState(existingReview);

  const router = useRouter();

  useEffect(() => {
    setExistReview(existingReview);

    setRating(existingReview?.rating ?? 0);

    setTitle(existingReview?.title ?? "");

    setComment(existingReview?.comment ?? "");
  }, [existingReview]);

  async function handleSubmit() {
    if (!rating) {
      appToast.warning("Warning", "Please select a rating");
      return;
    }

    if (!title.trim()) {
      appToast.warning("Warning", "Please enter a review title");
      return;
    }

    if (!comment.trim()) {
      appToast.warning("Warning", "Please share your experience");
      return;
    }

    try {
      setLoading(true);

      const isEditing = !!existReview;

      const res = await fetch(
        `/api/reviews/${isEditing ? "update" : "create"}`,
        {
          method: isEditing ? "PATCH" : "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            rating,
            title: title.trim(),
            comment: comment.trim(),
            productId,
            reviewId: existReview?.id,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        appToast.error("Error", data.message || "Failed to submit review");

        return;
      }

      setExistReview(data.review ?? data);

      appToast.success(
        "Success",
        isEditing
          ? "Review updated successfully"
          : "Review submitted successfully",
      );

      setRating(0);
      setTitle("");
      setComment("");

      router.refresh();

      onSuccess?.();
    } catch (error) {
      console.error("REVIEW SUBMIT ERROR:", error);

      appToast.error(
        "Error",
        "Something went wrong while submitting your review",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold">
          {existReview ? "Update Review" : "Write a Review"}
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Share your experience with this product.
        </p>
      </div>

      {/* Rating */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Your rating
        </label>

        <StarRatingInput value={rating} onChange={setRating} />
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="review-title"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Review title
        </label>

        <Input
          id="review-title"
          type="text"
          placeholder="e.g. Excellent quality"
          value={title}
          maxLength={100}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />

        <div className="mt-1 text-right text-xs text-gray-400">
          {title.length}/100
        </div>
      </div>

      {/* Comment */}
      <div>
        <label
          htmlFor="review-comment"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Your review
        </label>

        <Textarea
          id="review-comment"
          placeholder="Share your experience with this product..."
          value={comment}
          className="min-h-[120px]"
          maxLength={1000}
          disabled={loading}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setComment(e.target.value)
          }
        />

        <div className="mt-1 text-right text-xs text-gray-400">
          {comment.length}/1000
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <DialogClose asChild>
          <Button
            variant="outline"
            disabled={loading}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
        </DialogClose>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="min-w-[140px] text-white"
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
