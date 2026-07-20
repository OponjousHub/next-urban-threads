"use client";

import { RefreshCcw, CheckCircle2, AlertTriangle } from "lucide-react";

import { UploadStatus } from "@/types/image-uploader";

type Props = {
  status: UploadStatus;
};

export default function UploaderOverlay({ status }: Props) {
  if (status === "idle") {
    return null;
  }

  let icon = null;
  let title = "";
  let bgColor = "";

  switch (status) {
    case "uploading":
      icon = <RefreshCcw className="h-10 w-10 animate-spin text-white" />;

      title = "Uploading...";
      bgColor = "bg-black/60";
      break;

    case "success":
      icon = <CheckCircle2 className="h-10 w-10 text-white" />;

      title = "Uploaded";
      bgColor = "bg-green-600/80";
      break;

    case "failed":
      icon = <AlertTriangle className="h-10 w-10 text-white" />;

      title = "Upload Failed";
      bgColor = "bg-red-600/80";
      break;
  }

  return (
    <div
      className={`
        absolute
        inset-0
        z-20
        flex
        flex-col
        items-center
        justify-center
        transition-all
        duration-300
        ${bgColor}
      `}
    >
      {icon}

      <p className="mt-4 text-lg font-semibold text-white">{title}</p>
    </div>
  );
}
