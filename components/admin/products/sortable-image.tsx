"use client";

import Image from "next/image";

import { useSortable } from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

type Props = {
  id: string;
  image: string;
  onRemove: () => void;
};

export function SortableImage({ id, image, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative border rounded-2xl overflow-hidden bg-white"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <Image
          src={image}
          alt=""
          width={300}
          height={300}
          className="w-full h-40 object-cover"
        />
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 bg-black/70 text-white w-7 h-7 rounded-full"
      >
        ×
      </button>
    </div>
  );
}
