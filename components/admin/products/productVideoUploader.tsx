"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, X, RefreshCcw, Video } from "lucide-react";
import toast from "react-hot-toast";

type VideoItem = {
  url: string;
  public_id: string;
};

type UploadStatus = "queued" | "uploading" | "success" | "error" | "cancelled";

type UploadItem = {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
};

type Props = {
  videos: VideoItem[];
  setVideos: React.Dispatch<React.SetStateAction<VideoItem[]>>;
};

export function ProductVideoUploader({ videos, setVideos }: Props) {
  const [queue, setQueue] = useState<UploadItem[]>([]);

  const uploadControllers = useRef<Record<string, AbortController>>({});

  /* -------------------------------- DELETE VIDEO -------------------------------- */

  async function deleteVideo(video: VideoItem) {
    try {
      await fetch("/api/upload/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_id: video.public_id,
          resource_type: "video",
        }),
      });

      setVideos((prev) => prev.filter((v) => v.public_id !== video.public_id));

      toast.success("Video removed");
    } catch {
      toast.error("Failed to delete video");
    }
  }

  /* -------------------------------- SINGLE UPLOAD -------------------------------- */

  async function uploadSingle(item: UploadItem) {
    const controller = new AbortController();

    uploadControllers.current[item.id] = controller;

    setQueue((prev) =>
      prev.map((q) => (q.id === item.id ? { ...q, status: "uploading" } : q)),
    );

    try {
      const formData = new FormData();

      formData.append("video", item.file);

      const response = await fetch("/api/upload/video-upload", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      setVideos((prev) => [
        ...prev,
        {
          url: data.url,
          public_id: data.public_id,
        },
      ]);

      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? {
                ...q,
                status: "success",
                progress: 100,
              }
            : q,
        ),
      );

      toast.success(`${item.file.name} uploaded`);
    } catch (err: any) {
      if (err.name === "AbortError") {
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? {
                  ...q,
                  status: "cancelled",
                }
              : q,
          ),
        );

        toast("Upload cancelled");
      } else {
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? {
                  ...q,
                  status: "error",
                  error: "Upload failed",
                }
              : q,
          ),
        );

        toast.error(`${item.file.name} failed`);
      }
    }
  }

  /* -------------------------------- HANDLE SELECT -------------------------------- */

  async function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    const newItems: UploadItem[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: "queued",
    }));

    setQueue((prev) => [...prev, ...newItems]);

    for (const item of newItems) {
      await uploadSingle(item);
    }

    e.target.value = "";
  }

  /* -------------------------------- RETRY -------------------------------- */

  async function retryUpload(id: string) {
    const item = queue.find((q) => q.id === id);

    if (!item) return;

    uploadSingle(item);
  }

  /* -------------------------------- CANCEL -------------------------------- */

  function cancelUpload(id: string) {
    const controller = uploadControllers.current[id];

    if (controller) {
      controller.abort();
    }
  }

  return (
    <div className="space-y-6">
      {/* -------------------------------- VIDEO GRID -------------------------------- */}

      {videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video) => (
            <div
              key={video.public_id}
              className="relative rounded-2xl overflow-hidden border bg-white"
            >
              <video
                src={video.url}
                controls
                className="w-full h-64 object-cover"
              />

              <button
                type="button"
                onClick={() => deleteVideo(video)}
                className="absolute top-2 right-2 bg-white/90 rounded-full p-2 shadow hover:bg-red-50"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* -------------------------------- QUEUE -------------------------------- */}

      {queue.length > 0 && (
        <div className="space-y-3">
          {queue.map((item) => (
            <div key={item.id} className="border rounded-xl p-4 bg-white">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Video className="w-5 h-5 text-gray-500" />

                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.file.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {(item.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.status === "uploading" && (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />

                      <button
                        type="button"
                        onClick={() => cancelUpload(item.id)}
                        className="text-xs text-red-500"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {item.status === "error" && (
                    <button
                      type="button"
                      onClick={() => retryUpload(item.id)}
                      className="text-xs flex items-center gap-1 text-orange-500"
                    >
                      <RefreshCcw className="w-3 h-3" />
                      Retry
                    </button>
                  )}

                  {item.status === "success" && (
                    <span className="text-xs text-green-600">Uploaded</span>
                  )}

                  {item.status === "cancelled" && (
                    <span className="text-xs text-gray-500">Cancelled</span>
                  )}
                </div>
              </div>

              {/* PROGRESS */}
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black transition-all"
                  style={{
                    width: `${
                      item.status === "success"
                        ? 100
                        : item.status === "uploading"
                          ? 70
                          : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* -------------------------------- UPLOAD BUTTON -------------------------------- */}

      <label className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-black transition bg-white">
        <Upload className="w-8 h-8 mb-3 text-gray-500" />

        <span className="text-sm text-gray-700 font-medium">
          Click to upload product videos
        </span>

        <span className="text-xs text-gray-500 mt-1">
          MP4, MOV, WEBM supported
        </span>

        <input
          type="file"
          hidden
          multiple
          accept="video/*"
          onChange={handleSelect}
        />
      </label>
    </div>
  );
}
