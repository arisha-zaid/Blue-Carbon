// // src/components/RoleSelector.jsx
// import { useUserRole } from "../store/userRole";

// export default function RoleSelector() {
//   const { role, updateRole } = useUserRole();

//   return (
//     <div className="p-4 bg-white shadow rounded-xl mb-4 flex items-center gap-3">
//       <label className="font-medium text-gray-700">Select Role:</label>
//       <select
//         value={role}
//         onChange={(e) => updateRole(e.target.value)}
//         className="px-3 py-2 border rounded-lg"
//       >
//         <option value="Developer">Developer</option>
//         <option value="Verifier">Verifier</option>
//         <option value="Admin">Admin</option>
//       </select>
//       <span className="ml-3 text-sm text-gray-600">
//         Current Role: <b>{role}</b>
//       </span>
//     </div>
//   );
// }
