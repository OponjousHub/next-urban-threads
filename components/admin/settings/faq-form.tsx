"use client";

import { useEffect, useState } from "react";
import RichTextEditor from "@/components/ui/rich-text-editor";
import toast from "react-hot-toast";

type FAQ = {
  id: string;
  question: string;
  answer: string;
};

export default function FAQForm() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  // fetch
  useEffect(() => {
    fetch("/api/admin/faqs")
      .then((res) => res.json())
      .then(setFaqs);
  }, []);

  // add
  const addFAQ = async () => {
    if (!question || !answer) return;

    const res = await fetch("/api/admin/faqs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, answer }),
    });

    const newFaq = await res.json();

    setFaqs((prev) => [newFaq, ...prev]);
    setQuestion("");
    setAnswer("");

    toast.success("FAQ added ✅");
  };

  // delete
  const deleteFAQ = async (id: string) => {
    await fetch(`/api/admin/faqs/${id}`, {
      method: "DELETE",
    });

    setFaqs((prev) => prev.filter((f) => f.id !== id));
    toast.success("Deleted");
  };

  return (
    <div className="space-y-6">
      {/* ADD FAQ */}
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter question..."
          className="w-full border p-2 rounded"
        />

        <RichTextEditor value={answer} onChange={setAnswer} />

        <button
          onClick={addFAQ}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Add FAQ
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {faqs.map((faq) => (
          <div key={faq.id} className="border rounded-xl p-4 bg-white">
            <div className="flex justify-between">
              <p className="font-semibold">{faq.question}</p>

              <button
                onClick={() => deleteFAQ(faq.id)}
                className="text-red-500 text-sm"
              >
                Delete
              </button>
            </div>

            <div
              className="prose mt-2"
              dangerouslySetInnerHTML={{ __html: faq.answer }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
