"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type FormData = {
  aboutTitle?: string;
  aboutDescription?: string;
  aboutStory?: string;
  aboutImage?: string;
};

export default function AboutSettings() {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } =
    useForm<FormData>();

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/about");
      const data = await res.json();

      reset(data);
    }

    load();
  }, [reset]);

  async function onSubmit(data: FormData) {
    setLoading(true);

    await fetch("/api/admin/about", {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    toast.success("About page updated");
    setLoading(false);
  }

  const image = watch("aboutImage");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="bg-white p-6 rounded-2xl border space-y-6">
        <h2 className="text-lg font-semibold">About Page</h2>

        {/* TITLE */}
        <div>
          <label className="text-sm font-medium">Title</label>
          <input
            {...register("aboutTitle")}
            className="mt-1 w-full border px-3 py-2 rounded-lg"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-sm font-medium">Short Description</label>
          <textarea
            {...register("aboutDescription")}
            className="mt-1 w-full border px-3 py-2 rounded-lg"
          />
        </div>

        {/* STORY */}
        <div>
          <label className="text-sm font-medium">Full Story</label>
          <textarea
            {...register("aboutStory")}
            rows={6}
            className="mt-1 w-full border px-3 py-2 rounded-lg"
          />
        </div>

        {/* IMAGE */}
        <div>
          <label className="text-sm font-medium">Hero Image</label>

          {image && <img src={image} className="h-40 mb-3 rounded-lg" />}

          <input
            type="text"
            placeholder="Paste image URL"
            {...register("aboutImage")}
            className="w-full border px-3 py-2 rounded-lg"
          />
        </div>

        <button
          type="submit"
          className="bg-black text-white px-5 py-2 rounded-md"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
