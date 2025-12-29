// export function cloudinaryUrl(publicId: string, width = 400, height = 400) {
//   return `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/c_fill,w_${width},h_${height},q_auto,f_auto/${publicId}`;
// }
type ImagePreset = "card" | "detail" | "thumb";

const PRESETS: Record<ImagePreset, string> = {
  card: "c_fill,w_400,h_400,q_auto,f_auto",
  detail: "c_fill,w_800,h_800,q_auto,f_auto",
  thumb: "c_fill,w_100,h_100,q_auto,f_auto",
};

export function cloudinaryImage(url: string, preset: ImagePreset = "card") {
  if (!url || !url.includes("/upload/")) return url;

  return url.replace("/upload/", `/upload/${PRESETS[preset]}/`);
}

export function cloudinaryDetailImage(
  image?: string,
  preset: "detail" | "thumb" = "detail"
) {
  if (!image) return "";

  // If already a full URL, return as-is
  if (image.startsWith("http")) {
    return image;
  }

  const base = "https://res.cloudinary.com/dhdtanihv/image/upload";

  if (preset === "thumb") {
    return `${base}/c_fill,w_20,h_20,q_10,blur:100/${image}`;
  }

  return `${base}/c_fill,w_800,h_800,q_auto/${image}`;
}
