"use client";

import LegalEditor from "@/components/sheared/settings/legal-editor";

export default function VendorLegalSettings() {
  console.log("VENDOR PAGE -----------------------------");
  return <LegalEditor endpoint="/api/vendor/legal" />;
}
