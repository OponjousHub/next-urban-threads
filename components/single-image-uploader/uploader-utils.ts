import { appToast } from "@/utils/appToast";

export function validateImage(
  file: File,
  acceptedTypes: string[],
  maxSizeMB: number,
): boolean {
  if (!acceptedTypes.includes(file.type)) {
    appToast.error("Only PNG, JPG, JPEG and WEBP images are allowed.");

    return false;
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    appToast.error(`Image must not exceed ${maxSizeMB}MB.`);

    return false;
  }

  return true;
}
