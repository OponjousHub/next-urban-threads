"use client";

import { useEffect, useState, useTransition } from "react";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";

type Props = {
  tenantId: string;
};

export default function FollowStoreButton({ tenantId }: Props) {
  const [following, setFollowing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await fetch(`/api/store/is-following?tenantId=${tenantId}`);

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
              tenantId,
            }),
          },
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message);
        }

        toast.success(previous ? "Store unfollowed" : "Store followed");
      } catch (err: any) {
        // Rollback
        setFollowing(previous);

        toast.error(err.message || "Unable to update follow status.");
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
          //   following
          //     ? "bg-red-500 text-white hover:bg-red-600"
          //     : "bg-[var(--color-primary)] text-white hover:opacity-90"
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
