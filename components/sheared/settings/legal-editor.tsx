"use client";

import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";

import RichTextEditor from "@/components/ui/rich-text-editor";

import { appToast } from "@/utils/appToast";

type FormData = {
  termsOfService?: string;
  privacyPolicy?: string;
};

type Props = {
  endpoint: string;
};

/*
|--------------------------------------------------------------------------
| Default Terms of Service
|--------------------------------------------------------------------------
|
| These defaults are displayed only when the store does not have
| saved Terms of Service yet.
|
*/

const DEFAULT_TERMS_OF_SERVICE = `

<p>
  Welcome to our online store. By accessing or using this website,
  placing an order, or purchasing our products, you agree to comply
  with these Terms of Service.
</p><br/>

<h4>1. Use of Our Website</h4>

<p>
  You agree to use this website for lawful purposes and in a manner
  that does not infringe the rights of, restrict, or prevent the use
  and enjoyment of this website by others.
</p>

<p>
  You must not use this website for fraudulent, unlawful, abusive,
  or unauthorized activities.
</p><br/>

<h4>2. Products and Product Information</h4>

<p>
  We make reasonable efforts to ensure that product descriptions,
  images, prices, availability, and other information displayed on
  our website are accurate and up to date.
</p>

<p>
  However, product colors, appearance, measurements, and other details
  may vary depending on your device, display settings, manufacturing
  variations, or other circumstances.
</p>

<p>
  We reserve the right to correct errors, update product information,
  or change product availability at any time.
</p><br/>

<h4>3. Prices and Payments</h4>

<p>
  All prices displayed on the website are shown in the applicable store
  currency unless otherwise stated.
</p>

<p>
  Payment must be successfully authorized or confirmed before an order
  can be processed for delivery.
</p>

<p>
  We reserve the right to correct pricing errors and to cancel or
  refund orders affected by incorrect pricing where necessary.
</p><br/>

<h4>4. Orders</h4>

<p>
  Placing an order constitutes an offer to purchase the selected
  products subject to these Terms of Service.
</p>

<p>
  We reserve the right to accept, decline, cancel, or limit an order
  where necessary, including where products are unavailable, payment
  cannot be verified, or an error has occurred.
</p>

<p>
  If an order is cancelled after payment has been received, any eligible
  refund will be processed in accordance with our applicable refund
  procedures.
</p><br/>

<h4>5. Shipping and Delivery</h4>

<p>
  Orders are processed and delivered according to our Shipping Policy.
  Delivery times are estimates and may vary depending on the customer's
  location, selected shipping method, courier availability, public
  holidays, weather, or other circumstances outside our control.
</p>

<p>
  Customers are responsible for providing accurate delivery and contact
  information when placing an order.
</p><br/>

<h4>6. Returns and Refunds</h4>

<p>
  Returns and refunds are handled according to our Return & Refund Policy.
  Customers should review that policy before placing an order.
</p><br/>

<h4>7. Intellectual Property</h4>

<p>
  Unless otherwise stated, the content of this website, including text,
  graphics, logos, images, designs, icons, and other materials, is owned
  by or licensed to us and is protected by applicable intellectual
  property laws.
</p>

<p>
  You may not reproduce, distribute, modify, publish, or commercially
  exploit our website content without appropriate authorization.
</p><br/>

<h4>8. User Accounts</h4>

<p>
  If you create an account with us, you are responsible for maintaining
  the confidentiality of your account information and for activities
  carried out through your account.
</p>

<p>
  You agree to provide accurate information and to notify us if you
  believe your account has been accessed without authorization.
</p><br/>

<h4>9. Website Availability</h4>

<p>
  We aim to keep our website available and functioning properly.
  However, we do not guarantee that the website will always be available,
  uninterrupted, secure, or free from errors.
</p>

<p>
  We may temporarily suspend or restrict access to the website for
  maintenance, security, updates, or other operational reasons.
</p><br/>

<h4>10. Limitation of Liability</h4>

<p>
  To the extent permitted by applicable law, we will not be responsible
  for losses or damages arising from circumstances outside our reasonable
  control or from the misuse of our website or services.
</p><br/>

<h4>11. Changes to These Terms</h4>

<p>
  We may update these Terms of Service from time to time.
  Updated terms will be published on this website and will apply
  from the effective date stated or otherwise indicated.
</p><br/>

<h4>12. Contact Us</h4>

<p>
  If you have questions about these Terms of Service, please contact
  our customer support team using the contact information provided
  on our website.
</p>
`;

/*
|--------------------------------------------------------------------------
| Default Privacy Policy
|--------------------------------------------------------------------------
|
| These defaults are displayed only when the store does not have
| a saved Privacy Policy yet.
|
*/

const DEFAULT_PRIVACY_POLICY = `

<p>
  We respect your privacy and are committed to protecting the personal
  information you provide when using our website and services.
</p><br/>

<h4>1. Information We Collect</h4>

<p>
  Depending on how you use our website, we may collect information such
  as your name, email address, phone number, delivery address, billing
  information, order details, account information, and other information
  you provide to us.
</p>

<p>
  We may also collect certain technical information about your use of
  our website, such as device information, browser information, IP
  address, and information about how you interact with our website.
</p><br/>

<h4>2. How We Use Your Information</h4>

<p>
  We may use the information we collect to:
</p>

<ul>
  <li>Process and fulfill your orders.</li>
  <li>Provide customer support.</li>
  <li>Communicate with you about your orders and account.</li>
  <li>Process payments and related transactions.</li>
  <li>Improve our products, services, and website.</li>
  <li>Prevent fraud, abuse, and unauthorized activity.</li>
  <li>Send relevant communications where permitted.</li>
  <li>Comply with applicable legal and regulatory requirements.</li>
</ul><br/>

<h4>3. Payment Information</h4>

<p>
  Payments may be processed through third-party payment providers.
  We may not directly store complete payment card details where payment
  processing is handled by an external payment provider.
</p>

<p>
  Payment providers may process your information according to their own
  privacy policies and terms.
</p><br/>

<h4>4. Cookies and Similar Technologies</h4>

<p>
  We may use cookies and similar technologies to help operate our
  website, remember preferences, maintain sessions, improve performance,
  and understand how customers use our services.
</p>

<p>
  Your browser may provide controls for managing or restricting cookies,
  although disabling certain cookies may affect some website features.
</p><br/>

<h4>5. Sharing of Information</h4>

<p>
  We may share necessary information with trusted service providers
  who help us operate our business, including payment processors,
  delivery and logistics providers, hosting providers, technology
  providers, and customer support services.
</p>

<p>
  We may also disclose information where required by applicable law,
  legal process, or to protect our rights, customers, property, or
  security.
</p><br/>

<h4>6. Data Security</h4>

<p>
  We take reasonable measures to protect personal information against
  unauthorized access, alteration, disclosure, or destruction.
</p>

<p>
  However, no method of transmitting or storing information electronically
  can be guaranteed to be completely secure.
</p><br/>

<h4>7. Data Retention</h4>

<p>
  We retain personal information for as long as reasonably necessary
  to provide our services, fulfill transactions, maintain appropriate
  business records, resolve disputes, prevent fraud, and comply with
  applicable legal obligations.
</p><br/>

<h4>8. Your Privacy Rights</h4>

<p>
  Depending on applicable law, you may have rights regarding your
  personal information, including the right to request access,
  correction, deletion, restriction, or other forms of control over
  your information.
</p>

<p>
  To make a privacy-related request, please contact our support team.
</p><br/>

<h4>9. Children's Privacy</h4>

<p>
  Our services are not intended to be used in violation of applicable
  age restrictions. We do not knowingly collect personal information
  from children where prohibited by applicable law.
</p><br/>

<h4>10. Third-Party Services</h4>

<p>
  Our website may use third-party services for payments, analytics,
  hosting, communications, delivery, authentication, or other business
  functions.
</p>

<p>
  These third parties may process information according to their own
  privacy policies and applicable terms.
</p><br/>

<h4>11. Changes to This Privacy Policy</h4>

<p>
  We may update this Privacy Policy from time to time to reflect changes
  to our services, business practices, legal requirements, or other
  circumstances.
</p>

<p>
  Updated versions will be published on this website.
</p><br/>

<h4>12. Contact Us</h4>

<p>
  If you have questions about this Privacy Policy or how we handle
  personal information, please contact our customer support team using
  the contact information provided on our website.
</p>
`;

export default function LegalEditor({ endpoint }: Props) {
  const { handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: {
      termsOfService: DEFAULT_TERMS_OF_SERVICE,
      privacyPolicy: DEFAULT_PRIVACY_POLICY,
    },
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Load existing legal pages
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(endpoint);

        if (!res.ok) {
          throw new Error("Failed to load legal pages");
        }

        const data = await res.json();

        /*
        |--------------------------------------------------------------------------
        | Use saved content when it exists.
        |
        | Otherwise use the default content.
        |--------------------------------------------------------------------------
        */

        setValue(
          "termsOfService",
          data?.termsOfService?.trim()
            ? data.termsOfService
            : DEFAULT_TERMS_OF_SERVICE,
        );

        setValue(
          "privacyPolicy",
          data?.privacyPolicy?.trim()
            ? data.privacyPolicy
            : DEFAULT_PRIVACY_POLICY,
        );
      } catch (error) {
        console.error("Failed to load legal pages:", error);

        /*
        |--------------------------------------------------------------------------
        | Keep defaults visible if the request fails.
        |--------------------------------------------------------------------------
        */

        setValue("termsOfService", DEFAULT_TERMS_OF_SERVICE);

        setValue("privacyPolicy", DEFAULT_PRIVACY_POLICY);

        appToast.error(
          "Error",
          "Unable to load saved legal pages. Default content is being shown.",
        );
      } finally {
        setLoadingData(false);
      }
    }

    load();
  }, [setValue, endpoint]);

  const terms = watch("termsOfService") || "";

  const privacy = watch("privacyPolicy") || "";

  /*
  |--------------------------------------------------------------------------
  | Save
  |--------------------------------------------------------------------------
  */

  async function onSubmit(data: FormData) {
    try {
      setLoading(true);

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(
          responseData?.message || "Failed to update legal pages",
        );
      }

      appToast.success(
        "Legal pages updated",
        "Terms & Privacy saved successfully",
      );
    } catch (error) {
      console.error("Failed to update legal pages:", error);

      appToast.error(
        "Update failed",
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Loading state
  |--------------------------------------------------------------------------
  */

  if (loadingData) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center text-gray-500 shadow-sm">
        Loading legal pages...
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      {/* -------------------------------------------------- */}
      {/* Terms of Service */}
      {/* -------------------------------------------------- */}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Terms of Service</h2>

        <p className="mb-5 text-sm text-gray-500">
          Your store's terms and conditions are prefilled with default content.
          Review and customize them to reflect your business before publishing.
        </p>

        <RichTextEditor
          value={terms}
          onChange={(val) =>
            setValue("termsOfService", val, {
              shouldDirty: true,
            })
          }
        />
      </div>

      {/* -------------------------------------------------- */}
      {/* Privacy Policy */}
      {/* -------------------------------------------------- */}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Privacy Policy</h2>

        <p className="mb-5 text-sm text-gray-500">
          Your store's privacy policy is prefilled with default content. Review
          and customize it to match how your store collects and uses customer
          data.
        </p>

        <RichTextEditor
          value={privacy}
          onChange={(val) =>
            setValue("privacyPolicy", val, {
              shouldDirty: true,
            })
          }
        />
      </div>

      {/* -------------------------------------------------- */}
      {/* Save */}
      {/* -------------------------------------------------- */}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className={`
            px-5
            py-2
            rounded-md
            text-white
            text-sm
            transition
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed opacity-70"
                : "bg-[var(--color-primary)] hover:opacity-90"
            }
          `}
        >
          {loading ? (
            <span className="flex items-center gap-2 justify-center">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            "Save changes"
          )}
        </button>
      </div>
    </form>
  );
}
