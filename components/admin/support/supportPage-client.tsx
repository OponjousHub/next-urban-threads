"use client";

import { UpdateButtons } from "@/components/admin/support/update-buttons";
import toast from "react-hot-toast";
import { AdminToast } from "@/components/ui/adminToast";
import Link from "next/link";
import { useState } from "react";

type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  tag: string | null;
  priority: string;
};

export default function SupportPageClient({
  messages,
  allCount,
  statusParam,
  urgentCount,
  priorityParam,
  unreadCount,
}: {
  messages: Message[];
  allCount: number;
  statusParam?: string;
  urgentCount: number;
  priorityParam?: string;
  unreadCount: number;
}) {
  const [selected, setSelected] = useState<Message | null>(null);
  const [localMessages, setLocalMessages] = useState(messages);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  // ✅ SEND REPLY
  const sendReply = async () => {
    if (!selected || !reply) return;

    setSending(true);

    try {
      await fetch("/api/admin/support/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: selected.email,
          name: selected.name,
          message: reply,
        }),
      });

      setReply("");
      toast.success("Reply sent ✅");
    } catch (err) {
      toast.error("Failed to send reply ❌");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* LEFT: inbox */}
      <div className="p-6 border-r">
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white pb-4 mb-6">
          <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
            📩 Support Inbox
            <span className="text-gray-400">({allCount})</span>
          </h1>

          <div className="flex gap-3 flex-wrap">
            <FilterButton
              href="/admin/support"
              label="All"
              icon="📬"
              active={!statusParam && !priorityParam}
            />

            <FilterButton
              href="/admin/support?status=UNREAD"
              label="Unread"
              icon="📩"
              badge={unreadCount}
              active={statusParam === "UNREAD"}
            />

            <FilterButton
              href="/admin/support?status=RESOLVED"
              label="Resolved"
              icon="✅"
              active={statusParam === "RESOLVED"}
            />

            <FilterButton
              href="/admin/support?priority=HIGH"
              label="Urgent"
              icon="🔥"
              badge={urgentCount}
              active={priorityParam === "HIGH"}
            />
          </div>
        </div>

        {/* MESSAGE LIST */}
        <div className="space-y-3">
          {localMessages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => {
                setSelected({
                  ...msg,
                  status: "READ",
                });

                setLocalMessages((prev) =>
                  prev.map((m) =>
                    m.id === msg.id ? { ...m, status: "READ" } : m,
                  ),
                );

                if (msg.status === "UNREAD") {
                  fetch("/api/admin/support/update", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      id: msg.id,
                      status: "READ",
                    }),
                  });
                }
              }}
              className={`border rounded-xl p-3 cursor-pointer transition
                ${
                  selected?.id === msg.id
                    ? "bg-gray-100 border-black"
                    : "bg-white hover:bg-gray-50"
                }`}
            >
              <p
                className={`${
                  msg.status === "UNREAD" ? "font-extrabold" : "font-normal"
                }`}
              >
                {msg.name}
              </p>
              <p
                className={`${
                  msg.status === "UNREAD" ? "font-bold" : "font-normal"
                } text-xs text-gray-500`}
              >
                {msg.email}
              </p>

              <p
                className={`${
                  msg.status === "UNREAD" ? "font-bold" : "font-normal"
                } text-sm mt-2 truncate line-clamp-2 text-gray-600`}
              >
                {msg.message}
              </p>

              <div className="flex justify-between mt-2 text-xs">
                <span>{msg.tag}</span>
                <span>{msg.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: PREVIEW PANEL */}
      <div className="md:col-span-2 p-6">
        {!selected ? (
          <div className="text-gray-400 text-center mt-20">
            Select a message 👈
          </div>
        ) : (
          <div className="border rounded-xl p-6 bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{selected.name}</h2>
                <p className="text-sm text-gray-500">{selected.email}</p>
              </div>

              <UpdateButtons id={selected.id} status={selected.status} />
            </div>

            <div className="mt-6 whitespace-pre-line text-gray-700">
              {selected.message}
            </div>

            {/* ✅ REPLY BOX */}
            <div className="mt-6">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write a reply..."
                className="w-full border rounded-md p-3 h-32"
              />

              <button
                onClick={sendReply}
                disabled={sending}
                className="mt-3 bg-black text-white px-5 py-2 rounded-md"
              >
                {sending ? "Sending..." : "Reply"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({
  href,
  label,
  active,
  icon,
  badge,
}: {
  href: string;
  label: string;
  active?: boolean;
  icon?: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm border
        transition-all duration-200 transform hover:scale-105 hover:shadow-sm
        ${
          active
            ? "bg-black text-white border-black"
            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
        }`}
    >
      <span>{icon}</span>
      <span>{label}</span>

      {badge && badge > 0 && (
        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}
