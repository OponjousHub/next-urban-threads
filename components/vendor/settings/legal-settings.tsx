"use client";

import LegalEditor from "@/components/sheared/settings/legal-editor";

export default function VendorLegalSettings() {
  return <LegalEditor endpoint="/api/vendor/legal" />;
}
