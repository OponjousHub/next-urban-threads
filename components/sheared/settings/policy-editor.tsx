"use client";

import { useEffect, useState } from "react";

import { appToast } from "@/utils/appToast";

import RichTextEditor from "@/components/ui/rich-text-editor";

type Props = {
  endpoint: string;
};

/*
|--------------------------------------------------------------------------
| Default Shipping Policy
|--------------------------------------------------------------------------
|
| These defaults are shown only when the store does not have a
| saved shipping policy yet.
|
*/

const DEFAULT_SHIPPING_POLICY = `

<p>
  We are committed to getting your order to you safely and on time.
  Please review the information below before placing your order.
</p><br/>

<h4>1. Order Processing</h4>

<p>
  Orders are usually processed within <strong>1–3 business days</strong>
  after payment has been confirmed.
</p>

<p>
  Orders placed on weekends or public holidays will be processed on the
  next available business day.
</p><br/>

<h4>2. Delivery Times</h4>

<p>
  Delivery times depend on your location, the selected shipping method,
  and the availability of the items in your order.
</p>

<ul>
  <li>Local deliveries: approximately 1–3 business days</li>
  <li>Domestic deliveries: approximately 2–7 business days</li>
  <li>International deliveries: approximately 5–14 business days</li>
</ul>

<p>
  These delivery times are estimates and may vary due to circumstances
  outside our control, including courier delays, weather conditions,
  public holidays, or other unforeseen circumstances.
</p><br/>

<h4>3. Shipping Charges</h4>

<p>
  Shipping charges are calculated based on your delivery location,
  selected shipping method, order details, and applicable shipping rates.
</p>

<p>
  The applicable shipping cost will be displayed during checkout before
  you complete your order.
</p><br/>

<h4>4. Order Tracking</h4>

<p>
  Where tracking is available, tracking information will be provided
  after your order has been dispatched.
</p><br/>

<h4>5. Delivery Address</h4>

<p>
  Customers are responsible for providing a complete and accurate delivery
  address and contact information.
</p>

<p>
  We may not be responsible for delays or additional delivery charges
  resulting from incorrect or incomplete delivery information supplied
  by the customer.
</p><br/>

<h4>6. Delayed or Missing Orders</h4>

<p>
  If your order has not arrived within the expected delivery period,
  please contact our support team so that we can assist you in checking
  the status of your shipment.
</p><br/>

<h4>7. Contact Us</h4>

<p>
  If you have any questions about shipping or delivery, please contact
  our customer support team.
</p>
`;

/*
|--------------------------------------------------------------------------
| Default Return & Refund Policy
|--------------------------------------------------------------------------
|
| These defaults are shown only when the store does not have a
| saved return policy yet.
|
*/

const DEFAULT_RETURN_POLICY = `

<p>
  We want you to be satisfied with your purchase. If you receive an item
  that is damaged, defective, incorrect, or otherwise eligible for return,
  you may contact us to request a return or refund.
</p><br/>

<h4>1. Eligibility for Returns</h4>

<p>
  To be eligible for a return, items should generally be unused,
  in their original condition, and returned with the original packaging
  and relevant accessories where applicable.
</p>

<p>
  Certain products may not be eligible for return due to their nature,
  hygiene requirements, customization, or other applicable restrictions.
</p><br/>

<h4>2. Return Period</h4>

<p>
  Return requests should normally be submitted within
  <strong>7 days</strong> of receiving your order.
</p>

<p>
  Please contact our support team as soon as possible if you believe
  you have received a damaged, defective, or incorrect item.
</p><br/>

<h4>3. Damaged or Incorrect Items</h4>

<p>
  If your order arrives damaged or you receive an incorrect item,
  please contact us with your order details and, where requested,
  clear photographs or other relevant information.
</p>

<p>
  We will review the request and provide instructions on the next steps.
</p><br/>

<h4>4. Refunds</h4>

<p>
  Approved refunds will be processed after the return has been reviewed
  and the applicable refund conditions have been satisfied.
</p>

<p>
  Once a refund has been processed, the time required for the funds to
  appear in your account may depend on your payment provider or financial
  institution.
</p><br/>

<h4>5. Exchanges</h4>

<p>
  Exchanges may be available depending on product availability and the
  circumstances of the request.
</p>

<p>
  If an exchange is not available, an eligible refund or other appropriate
  resolution may be provided in accordance with our return policy.
</p><br/>

<h4>6. Non-Returnable Items</h4>

<p>
  Some products may not be eligible for return. These may include
  personalized items, products that have been used, opened or damaged
  after delivery, or other items identified as non-returnable.
</p><br/>

<h4>7. Return Shipping</h4>

<p>
  Where an item is returned because it is defective, damaged, or incorrect,
  we may cover applicable return shipping costs where appropriate.
</p>

<p>
  For other returns, return shipping costs may be the responsibility of
  the customer.
</p><br/>

<h4>8. How to Request a Return</h4>

<p>
  To request a return or refund, please contact our customer support team
  with your order number and details of the reason for your request.
</p>

<p>
  Our team will review your request and provide the appropriate
  instructions.
</p><br/>

<h4>9. Important Notice</h4>

<p>
  This policy may be updated from time to time to reflect changes in
  our business operations, applicable requirements, or the services
  we provide.
</p>

<p>
  If you have questions about our return or refund policy, please contact
  our customer support team before returning an item.
</p>
`;

export default function PolicyEditor({ endpoint }: Props) {
  const [shipping, setShipping] = useState(DEFAULT_SHIPPING_POLICY);

  const [returns, setReturns] = useState(DEFAULT_RETURN_POLICY);

  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load policies
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    async function fetchPolicies() {
      try {
        const res = await fetch(endpoint);

        if (!res.ok) {
          throw new Error("Failed to load policies");
        }

        const data = await res.json();

        /*
        |--------------------------------------------------------------------------
        | Important:
        |
        | If the database contains a saved policy, use it.
        |
        | If it is empty/null, use our default policy.
        |
        |--------------------------------------------------------------------------
        */

        setShipping(
          data?.shippingPolicy?.trim()
            ? data.shippingPolicy
            : DEFAULT_SHIPPING_POLICY,
        );

        setReturns(
          data?.returnPolicy?.trim()
            ? data.returnPolicy
            : DEFAULT_RETURN_POLICY,
        );
      } catch (error) {
        console.error("Failed to load policies:", error);

        /*
        |--------------------------------------------------------------------------
        | Even if the API fails, keep the default policies visible.
        |--------------------------------------------------------------------------
        */

        setShipping(DEFAULT_SHIPPING_POLICY);
        setReturns(DEFAULT_RETURN_POLICY);

        appToast.error(
          "Error",
          "Unable to load saved policies. Default policies are being shown.",
        );
      } finally {
        setLoadingData(false);
      }
    }

    fetchPolicies();
  }, [endpoint]);

  /*
  |--------------------------------------------------------------------------
  | Save policies
  |--------------------------------------------------------------------------
  */

  async function save() {
    setLoading(true);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shippingPolicy: shipping,
          returnPolicy: returns,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        appToast.error("Error", data?.message || "Failed to update policies.");

        return;
      }

      appToast.success("Success", "Policies updated successfully.");
    } catch (error) {
      console.error("Failed to save policies:", error);

      appToast.error("Error", "Failed to update policies.");
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
      <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
        Loading policies...
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-8">
      {/* -------------------------------------------------- */}
      {/* Shipping Policy */}
      {/* -------------------------------------------------- */}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Shipping Policy</h2>

        <p className="mb-5 text-sm text-gray-500">
          Explain your shipping process, delivery time and conditions. You can
          edit the default policy below to match your store.
        </p>

        <RichTextEditor value={shipping} onChange={setShipping} />
      </div>

      {/* -------------------------------------------------- */}
      {/* Return & Refund Policy */}
      {/* -------------------------------------------------- */}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Return & Refund Policy</h2>

        <p className="mb-5 text-sm text-gray-500">
          Tell customers how returns, refunds and exchanges work. You can edit
          the default policy below.
        </p>

        <RichTextEditor value={returns} onChange={setReturns} />
      </div>

      {/* -------------------------------------------------- */}
      {/* Save */}
      {/* -------------------------------------------------- */}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={loading}
          className="rounded-xl bg-black px-6 py-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Policies"}
        </button>
      </div>
    </div>
  );
}
