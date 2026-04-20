"use client";

import { useEffect, useState } from "react";

type Event = {
  id: string;
  status: string;
  title: string;
  message?: string;
  location?: string;
  createdAt: string;
};

export default function AdminOrderTrackingPage({
  params,
}: {
  params: { id: string };
}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [status, setStatus] = useState("SHIPPED");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const res = await fetch(`/api/orders/${params.id}/tracking`);
    const data = await res.json();
    setEvents(data);
  };

  const addTracking = async () => {
    await fetch(`/api/admin/orders/${params.id}/tracking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        title,
        message,
        location,
      }),
    });

    setTitle("");
    setMessage("");
    setLocation("");

    fetchEvents();
  };

  return (
    <div className="grid grid-cols-2 gap-10 p-6">
      {/* LEFT: FORM */}
      <div className="space-y-3 border p-4 rounded-xl">
        <h2 className="font-semibold text-lg">Update Tracking</h2>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border p-2 w-full"
        >
          <option>PLACED</option>
          <option>PAID</option>
          <option>PROCESSING</option>
          <option>PACKED</option>
          <option>SHIPPED</option>
          <option>IN_TRANSIT</option>
          <option>OUT_FOR_DELIVERY</option>
          <option>DELIVERED</option>
        </select>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="border p-2 w-full"
        />

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message"
          className="border p-2 w-full"
        />

        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (optional)"
          className="border p-2 w-full"
        />

        <button
          onClick={addTracking}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Add Update
        </button>
      </div>

      {/* RIGHT: TIMELINE */}
      <div className="border p-4 rounded-xl">
        <h2 className="font-semibold text-lg mb-4">Tracking Timeline</h2>

        <div className="border-l pl-4 space-y-6">
          {events.map((event) => (
            <div key={event.id} className="relative">
              <div className="absolute -left-[9px] top-1 w-3 h-3 bg-black rounded-full" />

              <p className="font-semibold">{event.title}</p>
              <p className="text-sm text-gray-600">{event.message}</p>
              <p className="text-xs text-gray-500">{event.location}</p>
              <p className="text-xs text-gray-400">
                {new Date(event.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
