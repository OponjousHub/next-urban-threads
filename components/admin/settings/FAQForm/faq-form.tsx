"use client";

import { useEffect, useState } from "react";
import RichTextEditor from "@/components/ui/rich-text-editor";
import toast from "react-hot-toast";
import SortableItem from "./sortableItem";
import FAQEditModal from "./FAQEditModal";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [category, setCategory] = useState("General");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150, // hold for 150ms before drag
        tolerance: 5,
      },
    }),
  );
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

  const openEditModal = (faq: any) => {
    setEditId(faq.id);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
    setIsEditOpen(true);
  };

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

  // Edit FAQ
  // const saveEdit = async (id: string) => {
  //   console.log("SAVING FAG", id);
  //   try {
  //     setLoadingEdit(true);
  //     await fetch(`/api/admin/faqs/${id}`, {
  //       method: "PATCH",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         question: editQuestion,
  //         answer: editAnswer,
  //         category,
  //       }),
  //     });

  //     setFaqs((prev) =>
  //       prev.map((f) =>
  //         f.id === id
  //           ? { ...f, question: editQuestion, answer: editAnswer }
  //           : f,
  //       ),
  //     );

  //     setEditingId(null);
  //   } catch (err) {
  //     toast.error("Failed to add FAQ ❌");
  //   } finally {
  //     setLoadingEdit(false);
  //   }
  // };
  const saveEdit = async () => {
    if (!editId) return;

    setLoadingEdit(true);

    try {
      await fetch(`/api/admin/faqs/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: editQuestion,
          answer: editAnswer,
          category,
        }),
      });

      setFaqs((prev) =>
        prev.map((f) =>
          f.id === editId
            ? { ...f, question: editQuestion, answer: editAnswer }
            : f,
        ),
      );

      setIsEditOpen(false);
      setEditId(null);
    } finally {
      setLoadingEdit(false);
    }
  };

  // delete
  const deleteFAQ = async (id: string) => {
    try {
      setDeletingId(id);
      await fetch(`/api/admin/faqs/${id}`, {
        method: "DELETE",
      });

      setFaqs((prev) => prev.filter((f) => f.id !== id));
      toast.success("Deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete FAQ ❌");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = faqs.findIndex((f) => f.id === active.id);
    const newIndex = faqs.findIndex((f) => f.id === over.id);

    const newItems = arrayMove(faqs, oldIndex, newIndex);

    setFaqs(newItems); // ✅ instant UI update

    // ✅ send new order to backend
    await fetch("/api/admin/faqs/reorder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: newItems.map((item, index) => ({
          id: item.id,
          order: index,
        })),
      }),
    });

    toast.success("Reordered ✅");
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

          <RichTextEditor value={answer} onChange={setAnswer} />

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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={faqs.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <SortableItem
                      key={faq.id}
                      faq={faq}
                      openId={openId}
                      setOpenId={setOpenId}
                      onEdit={openEditModal}
                      deleteFAQ={deleteFAQ}
                      deletingId={deletingId}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
      <FAQEditModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        question={editQuestion}
        setQuestion={setEditQuestion}
        answer={editAnswer}
        setAnswer={setEditAnswer}
        onSave={saveEdit}
        loading={loadingEdit}
      />
    </div>
  );
}
