export function cloudinaryUrl(publicId: string, width = 400, height = 400) {
  return `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/c_fill,w_${width},h_${height},q_auto,f_auto/${publicId}`;
}
