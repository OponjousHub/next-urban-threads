"use client";

import RichTextEditor from "@/components/ui/rich-text-editor";

type Props = {
  open: boolean;
  onClose: () => void;
  question: string;
  setQuestion: (v: string) => void;
  answer: string;
  setAnswer: (v: string) => void;
  onSave: () => void;
  loading: boolean;
};

export default function FAQEditModal({
  open,
  onClose,
  question,
  setQuestion,
  answer,
  setAnswer,
  onSave,
  loading,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold">Edit FAQ</h2>

        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Question"
        />

        <RichTextEditor value={answer} onChange={setAnswer} />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 text-gray-600">
            Cancel
          </button>

          <button
            onClick={onSave}
            disabled={loading}
            className="bg-black text-white px-4 py-1 rounded"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
