import { FiBell, FiSearch, FiMenu } from "react-icons/fi";
import { useState, useEffect } from "react";

interface Props {
  toggle: () => void;
}

type Activity = {
  id: string;
  type: "order" | "user" | "stock";
  message: string;
  time: string;
};

export default function AdminTopbar({ toggle }: Props) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Activity[]>([]);

  useEffect(() => {
    fetch("/api/admin/activities")
      .then((res) => res.json())
      .then(setNotifications);
  }, []);
  console.log("NOTIFICATIONS============", notifications);

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
          placeholder="Search orders, customers..."
          className="bg-transparent outline-none text-sm"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative" onClick={() => setOpen(!open)}>
          <FiBell size={20} className="text-gray-600" />
          <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
            {notifications?.length}
          </span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-300" />
          <span className="text-sm font-medium">Admin</span>
        </div>
      </div>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-xl p-4">
          {notifications?.map((n) => (
            <div key={n.id} className="text-sm border-b py-2">
              {n.message}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
