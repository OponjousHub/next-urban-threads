export default function ShippingPage() {
  return (
    <div className="bg-white text-gray-800">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* HEADER */}
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          Shipping & Returns
        </h1>
        <p className="text-gray-600 mb-10">
          We aim to deliver your orders quickly and ensure a smooth return
          experience if needed.
        </p>

        {/* SHIPPING SECTION */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Shipping Policy</h2>

          <div className="space-y-4 text-gray-600">
            <p>
              Orders are processed within <strong>1–2 business days</strong>.
              Once shipped, delivery times vary depending on your location.
            </p>

            <ul className="list-disc pl-5 space-y-2">
              <li>Local delivery: 2–5 business days</li>
              <li>International delivery: 5–10 business days</li>
              <li>Shipping fees are calculated at checkout</li>
            </ul>

            <p>
              You will receive a confirmation email with tracking information
              once your order has been shipped.
            </p>
          </div>
        </section>

        {/* TRACKING */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Order Tracking</h2>
          <p className="text-gray-600">
            After your order is shipped, you’ll receive a tracking number via
            email. You can use it to track your package in real time.
          </p>
        </section>

        {/* RETURNS */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Returns & Exchanges</h2>

          <div className="space-y-4 text-gray-600">
            <p>
              We accept returns within <strong>7–14 days</strong> of delivery.
              Items must be unused, in original packaging, and in resellable
              condition.
            </p>

            <ul className="list-disc pl-5 space-y-2">
              <li>Proof of purchase is required</li>
              <li>Final sale items cannot be returned</li>
              <li>Shipping fees are non-refundable</li>
            </ul>
          </div>
        </section>

        {/* REFUNDS */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Refunds</h2>
          <p className="text-gray-600">
            Once your return is received and inspected, we will notify you of
            the approval or rejection of your refund. Approved refunds are
            processed within <strong>3–5 business days</strong>.
          </p>
        </section>

        {/* CTA */}
        <section className="bg-gray-50 p-6 rounded-xl border">
          <h3 className="text-lg font-semibold mb-2">
            Need help with your order?
          </h3>
          <p className="text-gray-600 mb-4">
            Our support team is here to assist you with any questions.
          </p>

          <a
            href="/contact"
            className="inline-block bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
          >
            Contact Support
          </a>
        </section>
      </div>
    </div>
  );
}
