"use client";

import { useState } from "react";

const faqs = [
  {
    question: "How long does shipping take?",
    answer:
      "Orders are processed within 1–2 business days. Delivery typically takes 2–5 business days locally and 5–10 days internationally.",
  },
  {
    question: "Can I return my order?",
    answer:
      "Yes, we accept returns within 7–14 days of delivery. Items must be unused and in original packaging.",
  },
  {
    question: "How do I track my order?",
    answer:
      "Once your order is shipped, you’ll receive a tracking number via email. Use it on our tracking page to follow your order.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept major payment methods including cards, and other secure checkout options.",
  },
  {
    question: "Can I change or cancel my order?",
    answer:
      "Orders can only be modified or canceled within a short time after placing them. Please contact support immediately.",
  },
];

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white text-gray-800">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* HEADER */}
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-600 mb-10">
          Find answers to common questions about orders, shipping, returns, and
          more.
        </p>

        {/* FAQ LIST */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border rounded-xl overflow-hidden">
              <button
                onClick={() => toggle(index)}
                className="w-full flex justify-between items-center p-4 text-left font-medium hover:bg-gray-50 transition"
              >
                {faq.question}
                <span className="text-xl">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>

              {openIndex === index && (
                <div className="p-4 pt-0 text-gray-600 text-sm leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gray-50 p-6 rounded-xl border text-center">
          <h3 className="text-lg font-semibold mb-2">Still need help?</h3>
          <p className="text-gray-600 mb-4">
            Our support team is always ready to assist you.
          </p>

          <a
            href="/contact"
            className="inline-block bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
