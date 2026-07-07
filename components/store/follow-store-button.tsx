"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import { appToast } from "@/utils/appToast";

type Props = {
  tenantId: string;
};

export default function FollowStoreButton({ tenantId }: Props) {
  const [following, setFollowing] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch(`/api/store/is-following?tenantId=${tenantId}`);

    const data = await res.json();

    setFollowing(data.following);
  }

  async function toggle() {
    setLoading(true);

    try {
      const res = await fetch(
        following ? "/api/store/unfollow" : "/api/store/follow",
        {
          method: following ? "DELETE" : "POST",

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
        appToast.error("Failed", data.message);
        return;
      }

      setFollowing(data.following);

      appToast.success(
        "Success",
        data.following ? "Store followed" : "Store unfollowed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      disabled={loading}
      onClick={toggle}
      className="
      inline-flex
      items-center
      gap-2
      rounded-xl
      bg-[var(--color-primary)]
      px-7
      py-3
      font-semibold
      text-white
      shadow-md
      transition
      hover:opacity-90
      disabled:opacity-60
    "
    >
      <Heart size={18} className={following ? "fill-white" : ""} />

      {following ? "Following" : "Follow"}
    </button>
  );
}
