"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { appToast } from "@/utils/appToast";

type SocialLinks = {
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  whatsapp: string | null;
};

type Props = {
  social: SocialLinks | null;
};

export default function SocialSection({ social }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    facebookUrl: social?.facebookUrl ?? "",
    instagramUrl: social?.instagramUrl ?? "",
    twitterUrl: social?.twitterUrl ?? "",
    tiktokUrl: social?.tiktokUrl ?? "",
    youtubeUrl: social?.youtubeUrl ?? "",
    linkedinUrl: social?.linkedinUrl ?? "",
    websiteUrl: social?.websiteUrl ?? "",
    whatsapp: social?.whatsapp ?? "",
  });

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function save() {
    setLoading(true);

    try {
      const res = await fetch("/api/vendor/settings/social", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      appToast.success("Success", "Social media links updated");

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    {
      key: "websiteUrl",
      label: "Website",
      placeholder: "https://yourstore.com",
    },
    {
      key: "facebookUrl",
      label: "Facebook",
      placeholder: "https://facebook.com/yourstore",
    },
    {
      key: "instagramUrl",
      label: "Instagram",
      placeholder: "https://instagram.com/yourstore",
    },
    {
      key: "twitterUrl",
      label: "X (Twitter)",
      placeholder: "https://x.com/yourstore",
    },
    {
      key: "tiktokUrl",
      label: "TikTok",
      placeholder: "https://tiktok.com/@yourstore",
    },
    {
      key: "youtubeUrl",
      label: "YouTube",
      placeholder: "https://youtube.com/@yourstore",
    },
    {
      key: "linkedinUrl",
      label: "LinkedIn",
      placeholder: "https://linkedin.com/company/yourstore",
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      placeholder: "+2348012345678",
    },
  ] as const;

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Social Media</h2>

      <p className="mt-1 mb-8 text-sm text-gray-500">
        Help customers connect with your business.
      </p>

      <div className="grid gap-5">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="mb-2 block text-sm font-medium">
              {field.label}
            </label>

            <input
              value={form[field.key]}
              onChange={(e) => update(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full rounded-lg border p-3"
            />
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={save}
          disabled={loading}
          className="rounded-xl bg-black px-6 py-3 text-white hover:bg-gray-800"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
