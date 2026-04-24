"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import RichTextEditor from "@/components/ui/rich-text-editor";

type FormData = {
  termsOfService?: string;
  privacyPolicy?: string;
};

export default function LegalSettings() {
  const { handleSubmit, setValue, watch } = useForm<FormData>();

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

  //   if (!terms || !privacy)
  //     return <p>Terms of service or Privacy policy not found</p>;

  async function onSubmit(data: FormData) {
    await fetch("/api/admin/legal", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    alert("Saved");
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

      <button className="bg-black text-white px-6 py-2 rounded-md">
        Save Changes
      </button>
    </form>
  );
}
