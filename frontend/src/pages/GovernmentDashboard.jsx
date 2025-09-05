// // // src/pages/IndustryDashboard.jsx

// import React from 'react'

// const GovernmentDashboard = () => {
//   return (
//     <div>GovernmentDashboard</div>
//   )
// }

// export default GovernmentDashboard
// // import React, { useState } from "react";
// // import { motion } from "framer-motion";
// // import {
// //   PieChart,
// //   Pie,
// //   Cell,
// //   BarChart,
// //   Bar,
// //   XAxis,
// //   YAxis,
// //   Tooltip,
// //   ResponsiveContainer,
// // } from "recharts";
// // import { FiHome, FiUsers, FiBarChart2, FiSettings, FiDollarSign } from "react-icons/fi";

// // // Dummy data
// // const pieData = [
// //   { name: "Mangroves", value: 40 },
// //   { name: "Seagrass", value: 30 },
// //   { name: "Wetlands", value: 30 },
// // ];
// // const COLORS = ["#22c55e", "#16a34a", "#15803d"];

// // const barData = [
// //   { month: "Jan", credits: 120 },
// //   { month: "Feb", credits: 200 },
// //   { month: "Mar", credits: 150 },
// //   { month: "Apr", credits: 250 },
// //   { month: "May", credits: 300 },
// // ];

// // const projects = [
// //   { name: "Mangrove Guardians", credits: 120, status: "Active" },
// //   { name: "Seagrass Protectors", credits: 90, status: "Pending" },
// //   { name: "Coastal Green Warriors", credits: 70, status: "Active" },
// // ];

// // export default function IndustryDashboard() {
// //   const [activeTab, setActiveTab] = useState("overview");

// //   return (
// //     <div className="flex min-h-screen bg-gray-50">
// //       {/* Sidebar */}
// //       <aside className="w-64 bg-green-800 text-white flex flex-col">
// //         <div className="p-6 text-2xl font-bold">Industry Dashboard</div>
// //         <nav className="flex-1">
// //           <ul>
// //             {[
// //               { name: "Overview", icon: <FiHome />, tab: "overview" },
// //               { name: "Projects", icon: <FiUsers />, tab: "projects" },
// //               { name: "Analytics", icon: <FiBarChart2 />, tab: "analytics" },
// //               { name: "Investments", icon: <FiDollarSign />, tab: "investments" },
// //               { name: "Settings", icon: <FiSettings />, tab: "settings" },
// //             ].map((item) => (
// //               <li
// //                 key={item.tab}
// //                 className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-green-700 ${
// //                   activeTab === item.tab ? "bg-green-700 font-bold" : ""
// //                 }`}
// //                 onClick={() => setActiveTab(item.tab)}
// //               >
// //                 {item.icon}
// //                 {item.name}
// //               </li>
// //             ))}
// //           </ul>
// //         </nav>
// //       </aside>

// //       {/* Main content */}
// //       <main className="flex-1 p-6 space-y-6">
// //         {activeTab === "overview" && (
// //           <>
// //             {/* Summary Cards */}
// //             <div className="grid md:grid-cols-4 gap-6">
// //               <motion.div
// //                 whileHover={{ scale: 1.05 }}
// //                 className="bg-white shadow-lg rounded-2xl p-6 text-center"
// //               >
// //                 <p className="text-gray-600">Total Credits</p>
// //                 <p className="text-2xl font-bold">1,450 CO₂</p>
// //               </motion.div>

// //               <motion.div
// //                 whileHover={{ scale: 1.05 }}
// //                 className="bg-white shadow-lg rounded-2xl p-6 text-center"
// //               >
// //                 <p className="text-gray-600">Projects Participated</p>
// //                 <p className="text-2xl font-bold">8</p>
// //               </motion.div>

// //               <motion.div
// //                 whileHover={{ scale: 1.05 }}
// //                 className="bg-white shadow-lg rounded-2xl p-6 text-center"
// //               >
// //                 <p className="text-gray-600">Invested Amount</p>
// //                 <p className="text-2xl font-bold">$12,450</p>
// //               </motion.div>

// //               <motion.div
// //                 whileHover={{ scale: 1.05 }}
// //                 className="bg-white shadow-lg rounded-2xl p-6 text-center"
// //               >
// //                 <p className="text-gray-600">Top Project</p>
// //                 <p className="text-2xl font-bold">Mangrove Guardians</p>
// //               </motion.div>
// //             </div>

// //             {/* Charts */}
// //             <div className="grid md:grid-cols-2 gap-6 mt-6">
// //               {/* Pie Chart */}
// //               <div className="bg-white p-6 rounded-2xl shadow-lg">
// //                 <h2 className="font-semibold text-green-700 mb-4">Project Distribution</h2>
// //                 <ResponsiveContainer width="100%" height={250}>
// //                   <PieChart>
// //                     <Pie
// //                       data={pieData}
// //                       cx="50%"
// //                       cy="50%"
// //                       outerRadius={80}
// //                       label
// //                       dataKey="value"
// //                     >
// //                       {pieData.map((entry, index) => (
// //                         <Cell key={index} fill={COLORS[index % COLORS.length]} />
// //                       ))}
// //                     </Pie>
// //                   </PieChart>
// //                 </ResponsiveContainer>
// //               </div>

// //               {/* Bar Chart */}
// //               <div className="bg-white p-6 rounded-2xl shadow-lg">
// //                 <h2 className="font-semibold text-green-700 mb-4">Monthly Credits</h2>
// //                 <ResponsiveContainer width="100%" height={250}>
// //                   <BarChart data={barData}>
// //                     <XAxis dataKey="month" />
// //                     <YAxis />
// //                     <Tooltip />
// //                     <Bar dataKey="credits" fill="#16a34a" />
// //                   </BarChart>
// //                 </ResponsiveContainer>
// //               </div>
// //             </div>

// //             {/* Recent Projects Table */}
// //             <div className="bg-white p-6 rounded-2xl shadow-lg mt-6">
// //               <h2 className="font-semibold text-green-700 mb-4">My Projects</h2>
// //               <table className="w-full text-left border-collapse">
// //                 <thead>
// //                   <tr className="border-b border-gray-200">
// //                     <th className="py-2">Project</th>
// //                     <th className="py-2">Credits</th>
// //                     <th className="py-2">Status</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {projects.map((p, i) => (
// //                     <tr key={i} className="border-b border-gray-100">
// //                       <td className="py-2">{p.name}</td>
// //                       <td className="py-2">{p.credits}</td>
// //                       <td className="py-2">{p.status}</td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //               </table>
// //             </div>
// //           </>
// //         )}

// //         {activeTab === "projects" && (
// //           <div className="bg-white p-6 rounded-2xl shadow-lg">
// //             <h2 className="font-semibold text-green-700 mb-4">All Projects</h2>
// //             <p>Here Industry can view all available projects for investment.</p>
// //           </div>
// //         )}

// //         {activeTab === "analytics" && (
// //           <div className="bg-white p-6 rounded-2xl shadow-lg">
// //             <h2 className="font-semibold text-green-700 mb-4">Analytics</h2>
// //             <p>View detailed analytics and carbon credit trends.</p>
// //           </div>
// //         )}

// //         {activeTab === "investments" && (
// //           <div className="bg-white p-6 rounded-2xl shadow-lg">
// //             <h2 className="font-semibold text-green-700 mb-4">Investments</h2>
// //             <p>Invest in new projects or view current investment status.</p>
// //           </div>
// //         )}

// //         {activeTab === "settings" && (
// //           <div className="bg-white p-6 rounded-2xl shadow-lg">
// //             <h2 className="font-semibold text-green-700 mb-4">Settings</h2>
// //             <p>Update profile, manage notifications, and preferences.</p>
// //           </div>
// //         )}
// //       </main>
// //     </div>
// //   );
// // }
