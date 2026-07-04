"use client";

import PolicyEditor from "@/components/sheared/settings/policy-editor";

export default function PolicyForm() {
  return <PolicyEditor endpoint="/api/admin/settings/policies" />;
}
