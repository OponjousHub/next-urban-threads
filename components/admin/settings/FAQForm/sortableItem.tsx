import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

function SortableItemComponent({
  faq,
  openId,
  setOpenId,
  onEdit,
  deleteFAQ,
  deletingId,
}: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: faq.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-xl p-4 bg-white shadow-sm"
    >
      <div className="flex justify-between items-start">
        <div>
          <p
            className="font-semibold cursor-pointer"
            onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
          >
            {faq.question}
          </p>

          {openId === faq.id && (
            <div
              className="prose mt-2"
              dangerouslySetInnerHTML={{ __html: faq.answer }}
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => onEdit(faq)} className="text-blue-500 text-sm">
            Edit
          </button>

          <button
            onClick={() => deleteFAQ(faq.id)}
            className="text-red-500 text-sm"
          >
            {deletingId === faq.id ? "Deleting..." : "Delete"}
          </button>

          <button
            {...attributes}
            {...listeners}
            className="cursor-grab text-gray-400 hover:text-black"
          >
            ☰
          </button>
        </div>
      </div>
    </div>
  );
}

const areEqual = (prev: any, next: any) =>
  prev.faq.id === next.faq.id &&
  prev.openId === next.openId &&
  prev.deletingId === next.deletingId;

export default React.memo(SortableItemComponent, areEqual);
