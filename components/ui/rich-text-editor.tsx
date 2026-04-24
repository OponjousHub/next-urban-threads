"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (val: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {},
        orderedList: {},
        listItem: {},
      }),
    ],

    content: value || "",

    immediatelyRender: false,

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // ⚠️ CRITICAL FIX: only sync when VALUE changes externally (NOT every render)
  useEffect(() => {
    if (!editor) return;

    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "", {
        emitUpdate: false,
      });
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="border rounded-lg bg-white">
      <div className="flex gap-2 p-2 border-b flex-wrap">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <b>B</b>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <i>I</i>
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
