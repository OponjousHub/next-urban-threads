"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Store } from "lucide-react";

export default function VendorApplicationForm() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    description: "",
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch("/api/vendor/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit application");
      }

      toast.success("Application submitted successfully");

      setForm({
        businessName: "",
        businessEmail: "",
        businessPhone: "",
        description: "",
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl py-10 px-4">
      <Card className="shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3">
              <Store className="h-6 w-6" />
            </div>

            <div>
              <CardTitle className="text-3xl">Become a Vendor</CardTitle>

              <CardDescription>
                Join our marketplace and start selling your products to
                customers worldwide.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h3 className="mb-4 text-lg font-semibold">
                Business Information
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  placeholder="Business Name"
                  value={form.businessName}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      businessName: e.target.value,
                    })
                  }
                  required
                />

                <Input
                  type="email"
                  placeholder="Business Email"
                  value={form.businessEmail}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      businessEmail: e.target.value,
                    })
                  }
                  required
                />

                <Input
                  placeholder="Business Phone"
                  value={form.businessPhone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      businessPhone: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold">
                Business Description
              </h3>

              <Textarea
                rows={6}
                placeholder="Tell us about your business, products, and experience..."
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div className="rounded-xl border bg-muted/40 p-4 text-sm">
              By submitting this application, our team will review your
              information and contact you if additional verification is
              required.
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                "Submit Vendor Application"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
