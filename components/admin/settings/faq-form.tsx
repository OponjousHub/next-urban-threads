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
  const [loadingFAG, setLoadingFAG] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [category, setCategory] = useState("General");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");

  // fetch
  //   useEffect(() => {
  //     setLoadingFAG(true);
  //     fetch("/api/admin/faqs")
  //       .then((res) => res.json())
  //       .then(setFaqs);
  //     setLoadingFAG(false);
  //   }, []);
  useEffect(() => {
    const fetchFaqs = async () => {
      setLoadingFAG(true);

      const res = await fetch("/api/admin/faqs");
      const data = await res.json();

      setFaqs(data);
      setLoadingFAG(false);
    };

    fetchFaqs();
  }, []);

  // add
  const addFAQ = async () => {
    if (!question || !answer) return;

    try {
      setLoading(true);
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, answer, category }),
      });

      const newFaq = await res.json();

      setFaqs((prev) => [newFaq, ...prev]);
      setQuestion("");
      setAnswer("");

      toast.success("FAQ added ✅");
    } catch (err) {
      toast.error("Failed to add FAQ ❌");
    } finally {
      setLoading(false);
    }
  };

  const saveEdit = async (id: string) => {
    try {
      setLoadingEdit(true);
      await fetch(`/api/admin/faqs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: editQuestion,
          answer: editAnswer,
        }),
      });

      setFaqs((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, question: editQuestion, answer: editAnswer }
            : f,
        ),
      );

      setEditingId(null);
    } catch (err) {
      toast.error("Failed to add FAQ ❌");
    } finally {
      setLoadingEdit(false);
    }
  };

  // delete
  const deleteFAQ = async (id: string) => {
    try {
      setLoadingDelete(true);
      await fetch(`/api/admin/faqs/${id}`, {
        method: "DELETE",
      });

      setFaqs((prev) => prev.filter((f) => f.id !== id));
      toast.success("Deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete FAQ ❌");
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className={`${loading ? "opacity-60 pointer-events-none" : ""}`}>
      <div className="space-y-6">
        {/* ADD FAQ */}
        <div className="bg-white border rounded-xl p-4 space-y-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 rounded"
          >
            <option>General</option>
            <option>Shipping</option>
            <option>Payments</option>
            <option>Returns</option>
            <option>Orders</option>
          </select>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter question..."
            className="w-full border p-2 rounded"
          />

          <RichTextEditor
            key={answer} // 👈 forces reset
            value={answer}
            onChange={setAnswer}
          />

          <button
            onClick={addFAQ}
            disabled={loading}
            className={`
            px-4 py-2 rounded text-white transition-all
            ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"}
            `}
          >
            {loading ? "Saving..." : "Add FAQ"}
          </button>
        </div>

        {/* LIST */}
        <div className="space-y-3">
          {loadingFAG ? (
            <div className="flex items-center justify-center py-10 text-gray-500">
              <div className="animate-pulse flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>

                <span className="ml-3">Loading FAQs...</span>
              </div>
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center text-gray-400 py-10">No FAQs found</div>
          ) : (
            faqs.map((faq) => (
              <div key={faq.id} className="border rounded-xl p-4 bg-white">
                {editingId === faq.id ? (
                  // ✏️ EDIT MODE
                  <div
                    className={`${loadingEdit ? "opacity-60 pointer-events-none" : ""}`}
                  >
                    <div className="space-y-2">
                      <input
                        value={editQuestion}
                        onChange={(e) => setEditQuestion(e.target.value)}
                        className="w-full border p-2 rounded"
                      />

                      <RichTextEditor
                        value={editAnswer}
                        onChange={setEditAnswer}
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(faq.id)}
                          className="bg-black text-white px-3 py-1 rounded"
                        >
                          {loadingEdit ? "Saving..." : "Save"}
                        </button>

                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 👁️ VIEW MODE
                  <>
                    <div className="flex justify-between">
                      <p className="font-semibold">{faq.question}</p>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setEditingId(faq.id);
                            setEditQuestion(faq.question);
                            setEditAnswer(faq.answer);
                          }}
                          className="text-blue-500 text-sm"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteFAQ(faq.id)}
                          className="text-red-500 text-sm"
                        >
                          {loadingDelete ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>

                    <div
                      className="prose mt-2"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
