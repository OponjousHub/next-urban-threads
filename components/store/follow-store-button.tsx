"use client";

import { useEffect, useState, useTransition } from "react";
import { Heart } from "lucide-react";

type Props = {
  vendorId: string;
  onFollowersChange?: React.Dispatch<React.SetStateAction<number>>;
};

export default function FollowStoreButton({
  vendorId,
  onFollowersChange,
}: Props) {
  const [following, setFollowing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await fetch(`/api/store/is-following?vendorId=${vendorId}`);

      const data = await res.json();

      setFollowing(data.following);
    } finally {
      setLoaded(true);
    }
  }

  function toggle() {
    if (!loaded) return;

    const previous = following;

    // 🚀 Optimistic update
    setFollowing(!previous);

    if (onFollowersChange) {
      onFollowersChange((prev) => (previous ? prev - 1 : prev + 1));
    }

    startTransition(async () => {
      try {
        const res = await fetch(
          previous ? "/api/store/unfollow" : "/api/store/follow",
          {
            method: previous ? "DELETE" : "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              vendorId,
            }),
          },
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message);
        }
      } catch (err: any) {
        // Rollback
        setFollowing(previous);

        if (onFollowersChange) {
          onFollowersChange((prev) => (previous ? prev + 1 : prev - 1));
        }
      }
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={!loaded || isPending}
      className={`
        inline-flex
        items-center
        gap-2
        rounded-xl
        px-7
        py-3
        font-semibold
        transition-all
        duration-300
        shadow-md

        ${
          following
            ? "bg-green-600 text-white hover:bg-green-700"
            : "bg-[var(--color-primary)] text-white hover:opacity-90"
        }

        ${isPending ? "opacity-70" : ""}
      `}
    >
      <Heart
        size={18}
        className={`
          transition-all
          duration-300

          ${following ? "fill-white scale-110" : ""}
        `}
      />

      {following ? "Following" : "Follow"}
    </button>
  );
}
