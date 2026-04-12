"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Subscriber = {
  id: string;
  email: string;
};

export default function NewsletterAdminPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [progress, setProgress] = useState({
    total: 0,
    sent: 0,
    status: "idle",
  });

  // poll progress

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function startPolling() {
      interval = setInterval(async () => {
        const res = await fetch("/api/admin/subscribers/progress");
        const data = await res.json();

        setProgress(data);

        // ✅ STOP when done
        if (data.status === "done") {
          clearInterval(interval);
        }
      }, 1000);
    }
    startPolling();

    return () => clearInterval(interval);
  }, []);

  // Load subscribers
  useEffect(() => {
    async function loadSubscribers() {
      try {
        const res = await fetch("/api/admin/subscribers");
        const data = await res.json();
        setSubscribers(data);
      } catch {
        toast.error("Failed to load subscribers");
      }
    }

    loadSubscribers();
  }, []);

  // Send email
  async function sendNewsletter() {
    if (!subject || !message) {
      toast.error("Subject & message required");
      return;
    }

    try {
      setLoading(true);
      // startPolling();
      const res = await fetch("/api/admin/subscribers/send", {
        method: "POST",
        body: JSON.stringify({ subject, message }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error();

      toast.success("Newsletter sent 🚀");
      setSubject("");
      setMessage("");
    } catch {
      toast.error("Failed to send newsletter");
    } finally {
      setLoading(false);
    }
  }

  const percentage =
    progress.total > 0 ? Math.round((progress.sent / progress.total) * 100) : 0;

  return (
    <div className="p-8 max-w-5xl">
      {/* SEND FORM */}
      <div className="bg-white p-6 rounded-xl border mb-8">
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border p-3 rounded mb-4"
        />

        <textarea
          placeholder="Write your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border p-3 rounded mb-4 h-40"
        />

        <button
          onClick={sendNewsletter}
          disabled={loading}
          className="bg-[var(--color-primary)] text-white px-6 py-2 rounded"
        >
          {loading ? "Sending..." : "Send Newsletter"}
        </button>

        {/* 🔥 PROGRESS UI */}
        {progress.status !== "idle" && (
          <div className="mt-6">
            <p className="text-sm text-gray-600">
              Sending... {progress.sent} / {progress.total}
            </p>

            <div className="w-full bg-gray-200 rounded h-3 mt-2">
              <div
                className="bg-green-500 h-3 rounded transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>

            {progress.status === "done" && (
              <p className="text-green-600 mt-2">
                ✅ All emails sent successfully!
              </p>
            )}
          </div>
        )}
      </div>

      {/* SUBSCRIBERS LIST */}
      <div className="bg-white p-6 rounded-xl border">
        <h2 className="font-semibold mb-4">
          Subscribers ({subscribers.length})
        </h2>

        {subscribers.length === 0 ? (
          <p className="text-gray-500">No subscribers yet</p>
        ) : (
          <ul className="space-y-2">
            {subscribers.map((sub) => (
              <li key={sub.id} className="border p-2 rounded text-sm">
                {sub.email}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
