"use client";

import { useState } from "react";
import { ProductImageUploader } from "./productImageUploader";

export function ProductForm() {
  const [images, setImages] = useState<string[]>([]);

  return (
    <form className="space-y-6">
      {/* Other product fields */}

      <ProductImageUploader
        onUploadComplete={(uploadedImages) => setImages(uploadedImages)}
      />

      <button type="submit">Save Product</button>
    </form>
  );
}
