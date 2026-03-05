// "use client";

// import { Bell } from "lucide-react";

// export default function AdminTopbar() {
//   return (
//     <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8">
//       {/* Left */}
//       <div>
//         <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
//       </div>

//       {/* Right */}
//       <div className="flex items-center gap-6">
//         <button className="text-gray-500 hover:text-black transition">
//           <Bell size={20} />
//         </button>

//         <div className="flex items-center gap-2">
//           <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium">
//             A
//           </div>
//           <span className="text-sm font-medium text-gray-700">Admin</span>
//         </div>
//       </div>
//     </header>
//   );
// }
import { FiBell, FiSearch } from "react-icons/fi";

export default function AdminTopbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between">
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
        <button className="relative">
          <FiBell size={20} className="text-gray-600" />
          <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-300" />
          <span className="text-sm font-medium">Admin</span>
        </div>
      </div>
    </header>
  );
}
