export type UploadStatus = "idle" | "uploading" | "success" | "failed";

export type SingleImageUploaderProps = {
  label: string;
  image: string | null;
  onChange: (url: string | null) => void;

  height?: number;
  aspect?: string;
  maxSizeMB?: number;

  acceptedTypes?: string[];
};
