"use client";

import LegalEditor from "@/components/sheared/settings/legal-editor";

export default function LegalSettings() {
  return <LegalEditor endpoint="/api/admin/legal" />;
}
