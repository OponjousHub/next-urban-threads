"use client";

import { Share2 } from "lucide-react";
import { toast } from "react-hot-toast";

type Props = {
  title: string;
  description?: string;
};

export default function ShareStoreButton({ title, description }: Props) {
  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });

        return;
      } catch {
        return;
      }
    }

    await navigator.clipboard.writeText(url);

    toast.success("Store link copied to clipboard");
  }

  return (
    <button
      onClick={handleShare}
      className="
        inline-flex
        items-center
        gap-2
        rounded-xl
        border
        bg-white
        px-6
        py-3
        font-medium
        shadow-sm
        transition
        hover:shadow-md
      "
    >
      <Share2 size={18} />
      Share
    </button>
  );
}
