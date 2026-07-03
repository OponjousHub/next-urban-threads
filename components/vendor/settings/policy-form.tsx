"use client";

import PolicyEditor from "@/components/sheared/settings/policy-editor";

export default function VendorPoliciesPage() {
  return <PolicyEditor endpoint="/api/vendor/settings/policies" />;
}
