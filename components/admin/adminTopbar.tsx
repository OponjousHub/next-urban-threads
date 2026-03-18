import { FiBell, FiSearch, FiMenu } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";

interface Props {
  toggle: () => void;
  user?: User;
}

type Activity = {
  id: string;
  type: "order" | "user" | "stock";
  message: string;
  time: string;
};

type User = {
  name: string;
  image?: string | null;
};

export default function AdminTopbar({ toggle, user }: Props) {
  const [notifications, setNotifications] = useState<Activity[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/activities")
      .then((res) => res.json())
      .then(setNotifications);
  }, []);

  // Close the notification driopdown when outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between">
      <button
        onClick={toggle}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
      >
        <FiMenu size={20} />
      </button>
      {/* Search */}
      <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-lg">
        <FiSearch className="text-gray-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search orders, customers..."
          className="bg-transparent outline-none text-sm"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        <div className="relative">
          {/* Notifications */}
          <button className="relative" onClick={() => setOpen(!open)}>
            <FiBell size={20} className="text-gray-600" />
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
              {notifications?.length}
            </span>
          </button>
          {open && (
            <div
              ref={dropdownRef}
              className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-xl p-4 z-50"
            >
              {notifications?.map((n) => (
                <div key={n.id} className="text-sm border-b py-2">
                  {n.message}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2">
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs">
              {user?.name?.[0] || "A"}
            </div>
          )}

          <span className="text-sm font-medium">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
