// "use client";

// import { FiAlertCircle, FiPackage, FiUsers } from "react-icons/fi";

// export default function DashboardAlerts({
//   lowstock,
//   orderStatus,
//   newCustomers,
// }: {
//   lowstock: { id: string; name: string; stock: number }[];
//   orderStatus: number;
//   newCustomers: number;
// }) {
//   console.log(lowstock);
//   const alerts = [
//     lowstock.length > 0 && {
//       icon: <FiPackage />,
//       title: "Low Stock",
//       message: `${lowstock.length} products running low`,
//       color: "text-orange-600 bg-orange-100",
//     },
//     orderStatus > 0 && {
//       icon: <FiAlertCircle />,
//       title: "Pending Orders",
//       message: `${orderStatus} orders awaiting fulfillment`,
//       color: "text-yellow-600 bg-yellow-100",
//     },
//     newCustomers > 0 && {
//       icon: <FiUsers />,
//       title: "New Customers",
//       message: `${newCustomers} new customers today`,
//       color: "text-indigo-600 bg-indigo-100",
//     },
//   ].filter(Boolean);
//   // const alerts = [
//   //   {
//   //     icon: <FiPackage />,
//   //     title: "Low Stock",
//   //     message: `${lowstock} products running low`,
//   //     color: "text-orange-600 bg-orange-100",
//   //   },
//   //   {
//   //     icon: <FiAlertCircle />,
//   //     title: "Pending Orders",
//   //     message: `${orderStatus} orders awaiting fulfillment`,
//   //     color: "text-yellow-600 bg-yellow-100",
//   //   },
//   //   {
//   //     icon: <FiUsers />,
//   //     title: "New Customers",
//   //     message: `${newCustomers} new customers today`,
//   //     color: "text-indigo-600 bg-indigo-100",
//   //   },
//   // ];

//   return (
//     <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 h-full">
//       <h3 className="text-lg font-semibold mb-6">Alerts</h3>

//       <div className="space-y-4">
//         {alerts.map((alert, i) => (
//           <div
//             key={i}
//             className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
//           >
//             <div
//               className={`w-10 h-10 rounded-lg flex items-center justify-center ${alert.color}`}
//             >
//               {alert.icon}
//             </div>

//             <div>
//               <p className="font-medium text-gray-800">{alert.title}</p>
//               <p className="text-sm text-gray-500">{alert.message}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

"use client";

import { FiAlertCircle, FiPackage, FiUsers } from "react-icons/fi";

export default function DashboardAlerts({
  lowstock,
  orderStatus,
  newCustomers,
}: {
  lowstock: { id: string; name: string; stock: number }[];
  orderStatus: number;
  newCustomers: number;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 h-full">
      <h3 className="text-lg font-semibold mb-6">Alerts</h3>

      <div className="space-y-6">
        {/* Low stock section */}
        {lowstock?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <FiPackage />
              </div>
              <p className="font-medium text-gray-800">Low Stock</p>
            </div>

            <div className="space-y-2">
              {lowstock.map((product) => (
                <div
                  key={product.id}
                  className="flex justify-between text-sm text-gray-600"
                >
                  <span>{product.name}</span>
                  <span className="text-orange-600 font-medium">
                    {product.stock} left
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending orders */}
        {orderStatus > 0 && (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
              <FiAlertCircle />
            </div>

            <div>
              <p className="font-medium text-gray-800">Pending Orders</p>
              <p className="text-sm text-gray-500">
                {orderStatus} orders awaiting fulfillment
              </p>
            </div>
          </div>
        )}

        {/* New customers */}
        {newCustomers > 0 && (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <FiUsers />
            </div>

            <div>
              <p className="font-medium text-gray-800">New Customers</p>
              <p className="text-sm text-gray-500">
                {newCustomers} new customers today
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
