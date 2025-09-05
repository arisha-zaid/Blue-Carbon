// // src/pages/AdminDashboard.jsx
// import { useState, useEffect } from "react";
// import { getProjects, updateProjectStatus } from "../store/projects.js";

// export default function AdminDashboard() {
//   const [projects, setProjects] = useState([]);

//   useEffect(() => {
//     setProjects(getProjects());
//   }, []);

//   const handleApprove = (id) => {
//     const updated = updateProjectStatus(id, "Approved");
//     setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
//   };

//   const handleReject = (id) => {
//     const updated = updateProjectStatus(id, "Rejected");
//     setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
//   };

//   return (
//     <main className="flex-1 p-8 bg-gray-50 min-h-screen">
//       <h2 className="text-2xl font-bold mb-6">Admin: Project Review</h2>
//       <div className="bg-white rounded-2xl shadow overflow-x-auto">
//         <table className="w-full text-left">
//           <thead className="bg-gray-100 text-gray-600 text-sm">
//             <tr>
//               <th className="py-3 px-4">Project</th>
//               <th className="py-3 px-4">Location</th>
//               <th className="py-3 px-4">Pred. CO₂</th>
//               <th className="py-3 px-4">Risk</th>
//               <th className="py-3 px-4">Status</th>
//               <th className="py-3 px-4">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {projects.map((p) => (
//               <tr
//                 key={p.id}
//                 className="border-t hover:bg-gray-50 transition-colors duration-200"
//               >
//                 <td className="py-3 px-4">{p.name}</td>
//                 <td className="py-3 px-4">{p.location}</td>
//                 <td className="py-3 px-4">{p.predictedCO2}</td>
//                 <td className="py-3 px-4">{p.riskLevel}</td>
//                 <td className="py-3 px-4">{p.status}</td>
//                 <td className="py-3 px-4 flex gap-2">
//                   <button
//                     onClick={() => handleApprove(p.id)}
//                     className="px-3 py-1 bg-green-500 text-white rounded"
//                   >
//                     Approve
//                   </button>
//                   <button
//                     onClick={() => handleReject(p.id)}
//                     className="px-3 py-1 bg-red-500 text-white rounded"
//                   >
//                     Reject
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </main>
//   );
// }