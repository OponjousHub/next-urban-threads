"use client";

import { useEffect, useState } from "react";

type Event = {
  id: string;
  status: string;
  title: string;
  description?: string;
  location?: string;
  createdAt: string;
};

export default function OrderTrackingTimeline({
  orderId,
}: {
  orderId: string;
}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracking = async () => {
      setLoading(true);

      const res = await fetch(`/api/orders/${orderId}/tracking`);
      const data = await res.json();

      setEvents(data);
      setLoading(false);
    };

    fetchTracking();
  }, [orderId]);

  if (loading) {
    return <p className="text-gray-500">Loading tracking...</p>;
  }

  if (!events.length) {
    return <p className="text-gray-400">No tracking updates yet</p>;
  }

  return (
    <div className="border-l pl-4 space-y-6">
      {events.map((event) => (
        <div key={event.id} className="relative">
          {/* dot */}
          <div className="absolute -left-[9px] top-1 w-3 h-3 bg-black rounded-full" />

          <p className="font-semibold">{event.title}</p>

          {event.description && (
            <p className="text-sm text-gray-600">{event.description}</p>
          )}

          {event.location && (
            <p className="text-xs text-gray-500">📍 {event.location}</p>
          )}

          <p className="text-xs text-gray-400">
            {new Date(event.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
