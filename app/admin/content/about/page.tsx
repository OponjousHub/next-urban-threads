"use client";

import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";

import { appToast } from "@/utils/appToast";

type FormData = {
  aboutTitle?: string;
  aboutDescription?: string;
  aboutStory?: string;
  aboutImage?: string;
};

/*
|--------------------------------------------------------------------------
| Default About Content
|--------------------------------------------------------------------------
|
| These defaults are used only when the store does not have saved
| About content yet.
|
| They are intentionally store-neutral.
|
| Do NOT mention:
| - Urban Threads
| - AfriShop
| - Multi-vendor
| - SaaS
| - Ecommerce engine
|
| The store owner can customize everything before or after saving.
|
*/

const DEFAULT_ABOUT_TITLE = "About Us";

const DEFAULT_ABOUT_DESCRIPTION =
  "We are committed to bringing you quality products, a seamless shopping experience, and service you can trust.";

const DEFAULT_ABOUT_STORY = `Our Story

Our journey began with a simple idea — to make discovering and purchasing quality products easier, more enjoyable, and more reliable.

We believe shopping should be more than simply finding a product. It should be an experience built around quality, convenience, trust, and excellent service.

That's why we carefully select our products and continuously work to improve the way we serve our customers.

From the moment you discover a product to the moment it arrives at your doorstep, our goal is to provide a smooth and dependable shopping experience.

We are committed to building lasting relationships with our customers and earning your trust with every order.

Thank you for choosing us and becoming part of our journey.`;

/*
|--------------------------------------------------------------------------
| Default image
|--------------------------------------------------------------------------
|
| We intentionally leave this empty.
|
| The About page can use its own frontend fallback image when
| aboutImage is not configured.
|
*/

const DEFAULT_ABOUT_IMAGE = "";

export default function AboutSettings() {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      aboutTitle: DEFAULT_ABOUT_TITLE,
      aboutDescription: DEFAULT_ABOUT_DESCRIPTION,
      aboutStory: DEFAULT_ABOUT_STORY,
      aboutImage: DEFAULT_ABOUT_IMAGE,
    },
  });

  /*
  |--------------------------------------------------------------------------
  | Load existing About content
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/about");

        if (!res.ok) {
          throw new Error("Failed to load About page");
        }

        const data = await res.json();

        /*
        |--------------------------------------------------------------------------
        | Important:
        |
        | Saved database values take priority.
        |
        | Empty/null fields receive the default value.
        |--------------------------------------------------------------------------
        */

        reset({
          aboutTitle: data?.aboutTitle?.trim()
            ? data.aboutTitle
            : DEFAULT_ABOUT_TITLE,

          aboutDescription: data?.aboutDescription?.trim()
            ? data.aboutDescription
            : DEFAULT_ABOUT_DESCRIPTION,

          aboutStory: data?.aboutStory?.trim()
            ? data.aboutStory
            : DEFAULT_ABOUT_STORY,

          aboutImage: data?.aboutImage || DEFAULT_ABOUT_IMAGE,
        });
      } catch (error) {
        console.error("Failed to load About page:", error);

        /*
        |--------------------------------------------------------------------------
        | If loading fails, keep the defaults visible.
        |--------------------------------------------------------------------------
        */

        reset({
          aboutTitle: DEFAULT_ABOUT_TITLE,
          aboutDescription: DEFAULT_ABOUT_DESCRIPTION,
          aboutStory: DEFAULT_ABOUT_STORY,
          aboutImage: DEFAULT_ABOUT_IMAGE,
        });

        appToast.error(
          "Error",
          "Unable to load saved About content. Default content is being shown.",
        );
      } finally {
        setLoadingData(false);
      }
    }

    load();
  }, [reset]);

  /*
  |--------------------------------------------------------------------------
  | Save About page
  |--------------------------------------------------------------------------
  */

  async function onSubmit(data: FormData) {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/about", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aboutTitle: data.aboutTitle?.trim() || DEFAULT_ABOUT_TITLE,

          aboutDescription:
            data.aboutDescription?.trim() || DEFAULT_ABOUT_DESCRIPTION,

          aboutStory: data.aboutStory?.trim() || DEFAULT_ABOUT_STORY,

          aboutImage: data.aboutImage?.trim() || null,
        }),
      });

      const responseData = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(responseData?.message || "Failed to update About page");
      }

      /*
      |--------------------------------------------------------------------------
      | Keep the form synchronized with what was saved.
      |--------------------------------------------------------------------------
      */

      reset({
        aboutTitle: data.aboutTitle?.trim() || DEFAULT_ABOUT_TITLE,

        aboutDescription:
          data.aboutDescription?.trim() || DEFAULT_ABOUT_DESCRIPTION,

        aboutStory: data.aboutStory?.trim() || DEFAULT_ABOUT_STORY,

        aboutImage: data.aboutImage?.trim() || "",
      });

      appToast.success("Success", "About page updated successfully.");
    } catch (error) {
      console.error("Failed to update About page:", error);

      appToast.error(
        "Error",
        error instanceof Error ? error.message : "Failed to update About page.",
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Upload About image
  |--------------------------------------------------------------------------
  */

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("image", file);

      const res = await fetch("/api/upload/image-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Image upload failed");
      }

      /*
      |--------------------------------------------------------------------------
      | Store uploaded image inside the form.
      |--------------------------------------------------------------------------
      */

      setValue("aboutImage", data.url, {
        shouldDirty: true,
      });

      appToast.success(
        "Upload successful",
        "About image uploaded successfully.",
      );
    } catch (error) {
      console.error("About image upload failed:", error);

      appToast.error(
        "Error",
        error instanceof Error ? error.message : "Upload failed. Try again.",
      );
    } finally {
      setUploading(false);

      /*
      |--------------------------------------------------------------------------
      | Allow selecting the same file again later.
      |--------------------------------------------------------------------------
      */

      e.target.value = "";
    }
  }

  const image = watch("aboutImage") || "";

  /*
  |--------------------------------------------------------------------------
  | Loading state
  |--------------------------------------------------------------------------
  */

  if (loadingData) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center text-gray-500 shadow-sm">
        Loading About page...
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm">
        {/* ------------------------------------------------ */}
        {/* Header */}
        {/* ------------------------------------------------ */}

        <div>
          <h2 className="text-lg font-semibold">About Page</h2>

          <p className="mt-1 text-sm text-gray-500">
            Tell customers about your business, your story, and what makes your
            store unique.
          </p>
        </div>

        {/* ------------------------------------------------ */}
        {/* Store Title */}
        {/* ------------------------------------------------ */}

        <div>
          <label htmlFor="aboutTitle" className="text-sm font-medium">
            Title
          </label>

          <input
            id="aboutTitle"
            {...register("aboutTitle")}
            className="mt-1 w-full rounded-lg border px-3 py-2 outline-none transition focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            placeholder="About Us"
          />

          <p className="mt-1 text-xs text-gray-400">
            The main heading displayed on your About page.
          </p>
        </div>

        {/* ------------------------------------------------ */}
        {/* Description */}
        {/* ------------------------------------------------ */}

        <div>
          <label htmlFor="aboutDescription" className="text-sm font-medium">
            Short Description
          </label>

          <textarea
            id="aboutDescription"
            {...register("aboutDescription")}
            rows={3}
            className="mt-1 w-full rounded-lg border px-3 py-2 outline-none transition focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            placeholder="Tell customers briefly what your business is about..."
          />

          <p className="mt-1 text-xs text-gray-400">
            A short introduction that appears near the beginning of your About
            page.
          </p>
        </div>

        {/* ------------------------------------------------ */}
        {/* Full Story */}
        {/* ------------------------------------------------ */}

        <div>
          <label htmlFor="aboutStory" className="text-sm font-medium">
            Full Story
          </label>

          <textarea
            id="aboutStory"
            {...register("aboutStory")}
            rows={12}
            className="mt-1 w-full rounded-lg border px-3 py-2 leading-6 outline-none transition focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            placeholder="Tell customers about your business..."
          />

          <p className="mt-1 text-xs text-gray-400">
            Share your business story, values, mission, and what makes your
            store special.
          </p>
        </div>

        {/* ------------------------------------------------ */}
        {/* About Image */}
        {/* ------------------------------------------------ */}

        <div>
          <label className="text-sm font-medium">About Image</label>

          <p className="mt-1 mb-3 text-xs text-gray-400">
            Add an image that represents your business or brand. This is
            optional.
          </p>

          <div className="rounded-xl border-2 border-dashed p-6 text-center">
            {!image ? (
              <label className="block cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-6 w-6"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />

                      <circle cx="8.5" cy="8.5" r="1.5" />

                      <path d="m21 15-5-5L5 21" />
                    </svg>
                  </div>

                  <span className="text-sm font-medium text-gray-700">
                    {uploading ? "Uploading..." : "Click to upload image"}
                  </span>

                  {!uploading && (
                    <span className="text-xs text-gray-400">
                      JPG, PNG, WEBP or other supported image formats
                    </span>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={image}
                  alt="About page preview"
                  className="h-32 w-auto max-w-full rounded-lg border object-cover shadow-sm"
                />

                <div className="flex items-center gap-4">
                  <label className="cursor-pointer text-sm font-medium text-[var(--color-primary)] hover:underline">
                    {uploading ? "Uploading..." : "Change image"}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setValue("aboutImage", "", {
                        shouldDirty: true,
                      })
                    }
                    className="text-sm text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------------ */}
        {/* Save */}
        {/* ------------------------------------------------ */}

        <div className="flex justify-end border-t pt-5">
          <button
            type="submit"
            disabled={loading || uploading}
            className={`
              rounded-xl
              px-6
              py-3
              text-sm
              font-medium
              text-white
              transition
              ${
                loading || uploading
                  ? "cursor-not-allowed bg-gray-400 opacity-70"
                  : "bg-[var(--color-primary)] hover:opacity-90"
              }
            `}
          >
            {loading ? "Saving..." : "Save About Page"}
          </button>
        </div>
      </div>
    </form>
  );
}
