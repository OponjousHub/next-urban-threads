"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import RichTextEditor from "@/components/ui/rich-text-editor";
import toast from "react-hot-toast";
import { AdminToast } from "@/components/ui/adminToast";

type FormData = {
  termsOfService?: string;
  privacyPolicy?: string;
};

export default function LegalSettings() {
  const { handleSubmit, setValue, watch } = useForm<FormData>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/legal");
      const data = await res.json();

      setValue("termsOfService", data.termsOfService);
      setValue("privacyPolicy", data.privacyPolicy);
    }

    load();
  }, [setValue]);

  const terms = watch("termsOfService");
  const privacy = watch("privacyPolicy");

  // if (!terms || !privacy)
  //   return <p>Terms of service or Privacy policy not found</p>;

  async function onSubmit(data: FormData) {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/legal", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();

      toast.custom(
        <AdminToast
          type="success"
          title="Legal pages updated"
          description="Terms & Privacy saved successfully"
        />,
        { duration: 4000 },
      );
    } catch {
      toast.custom(
        <AdminToast
          type="error"
          title="Update failed"
          description="Something went wrong"
        />,
        { duration: 6000 },
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <div>
        <h2 className="text-lg font-semibold mb-2">Terms of Service</h2>
        <RichTextEditor
          value={terms}
          onChange={(val) => setValue("termsOfService", val)}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Privacy Policy</h2>
        <RichTextEditor
          value={privacy}
          onChange={(val) => setValue("privacyPolicy", val)}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`px-5 py-2 rounded-md text-white text-sm transition
    ${
      loading
        ? "bg-gray-400 cursor-not-allowed opacity-70"
        : "bg-[var(--color-primary)] hover:opacity-90"
    }
  `}
      >
        {loading ? (
          <span className="flex items-center gap-2 justify-center">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Saving...
          </span>
        ) : (
          "Save changes"
        )}
      </button>
    </form>
  );
}
