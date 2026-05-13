export function cloudinaryVideo(url: string) {
  return url.replace("/upload/", "/upload/q_auto:good,vc_auto,f_auto/");
}
