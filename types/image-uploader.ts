export type UploadStatus = "idle" | "uploading" | "success" | "failed";

export type SingleImageUploaderProps = {
  label: string;
  image: string | null;
  onChange: (url: string | null) => void;

  height?: number;

  maxSizeMB?: number;

  acceptedTypes?: string[];
};
