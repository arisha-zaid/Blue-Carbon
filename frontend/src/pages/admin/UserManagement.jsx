// src/pages/admin/UserManagement.jsx
import React, { useMemo, useState } from "react";
import { useNotification } from "../../context/NotificationContext";
import {
  Search,
  Filter,
  UserPlus,
  UserMinus,
  CheckCircle2,
  Shield,
  UserCog,
  Mail,
  Ban,
  Unlock,
} from "lucide-react";

const ROLES = ["All", "Admin", "Project Owner", "Industry", "Government"];
const MOCK_USERS = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Admin", blocked: false, joined: "2025-07-12" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "Project Owner", blocked: true, joined: "2025-08-02" },
  { id: 3, name: "Carol White", email: "carol@example.com", role: "Industry", blocked: false, joined: "2025-06-23" },
  { id: 4, name: "David Lee", email: "david@example.com", role: "Government", blocked: false, joined: "2025-05-10" },
  { id: 5, name: "Eva Brown", email: "eva@example.com", role: "Project Owner", blocked: true, joined: "2025-08-29" },
  { id: 6, name: "Mohit Kumar", email: "mohit@example.com", role: "Industry", blocked: false, joined: "2025-08-14" },
  { id: 7, name: "Priya Singh", email: "priya@example.com", role: "Government", blocked: false, joined: "2025-07-30" },
];

export default function UserManagement() {
  const { addNotification } = useNotification();

  const [users, setUsers] = useState(MOCK_USERS);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState({ email: "", role: "Project Owner" });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchR = roleFilter === "All" ? true : u.role === roleFilter;
      return matchQ && matchR;
    });
  }, [users, query, roleFilter]);

  const toggleSelect = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleSelectAll = () =>
    setSelectedIds((prev) =>
      prev.length === filtered.length ? [] : filtered.map((u) => u.id)
    );

  const changeRole = (id, nextRole) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: nextRole } : u)));
    addNotification(`Role updated to ${nextRole}`, "success");
  };

  const blockUser = (id) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, blocked: true } : u)));
    addNotification("User blocked", "success");
  };

  const unblockUser = (id) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, blocked: false } : u)));
    addNotification("User unblocked", "success");
  };

  const bulkBlock = () => {
    if (!selectedIds.length) return;
    setUsers((prev) => prev.map((u) => (selectedIds.includes(u.id) ? { ...u, blocked: true } : u)));
    setSelectedIds([]);
    addNotification("Selected users blocked", "success");
  };

  const bulkUnblock = () => {
    if (!selectedIds.length) return;
    setUsers((prev) =>
      prev.map((u) => (selectedIds.includes(u.id) ? { ...u, blocked: false } : u))
    );
    setSelectedIds([]);
    addNotification("Selected users unblocked", "success");
  };

  const openInvite = () => {
    setInviteOpen(true);
    setInvite({ email: "", role: "Project Owner" });
  };

  const sendInvite = (e) => {
    e.preventDefault();
    if (!invite.email) {
      addNotification("Enter an email to invite.", "error");
      return;
    }
    setInviteOpen(false);
    addNotification(`Invitation sent to ${invite.email} (${invite.role})`, "success");
  };

  return (
    // <div className="space-y-6">
    //   {/* Header */}
    //   <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    //     <div>
    //       <h1 className="text-3xl font-bold">User Management</h1>
    //       <p className="text-gray-600 mt-1">Manage roles, status, and invites across the registry.</p>
    //     </div>
    //     <div className="flex items-center gap-3">
    //       <button
    //         onClick={openInvite}
    //         className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:brightness-110"
    //       >
    //         <UserPlus className="w-4 h-4" /> Invite User
    //       </button>
    //       <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-gray-700">
    //         <Shield className="w-4 h-4" /> Admin Tools
    //       </div>
    //     </div>
    //   </header>

    //   {/* Toolbar */}
    //   <div className="bg-white rounded-2xl shadow p-4 flex flex-col md:flex-row md:items-center gap-3">
    //     <div className="relative flex-1">
    //       <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
    //       <input
    //         value={query}
    //         onChange={(e) => setQuery(e.target.value)}
    //         placeholder="Search name or email"
    //         className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
    //       />
    //     </div>

    //     <div className="flex items-center gap-2">
    //       <Filter className="w-4 h-4 text-gray-600" />
    //       <select
    //         value={roleFilter}
    //         onChange={(e) => setRoleFilter(e.target.value)}
    //         className="py-2 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
    //       >
    //         {ROLES.map((r) => (
    //           <option key={r} value={r}>
    //             {r}
    //           </option>
    //         ))}
    //       </select>
    //     </div>

    //     <div className="flex items-center gap-2">
    //       <button
    //         onClick={bulkBlock}
    //         className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
    //       >
    //         <Ban className="w-4 h-4" /> Block Selected
    //       </button>
    //       <button
    //         onClick={bulkUnblock}
    //         className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
    //       >
    //         <Unlock className="w-4 h-4" /> Unblock Selected
    //       </button>
    //     </div>
    //   </div>

    //   {/* Table/Grid */}
    //   <div className="bg-white rounded-2xl shadow overflow-hidden">
    //     <table className="w-full text-left">
    //       <thead className="bg-gray-50 text-gray-600 text-sm">
    //         <tr>
    //           <th className="py-3 px-4">
    //             <input
    //               type="checkbox"
    //               checked={selectedIds.length === filtered.length && filtered.length > 0}
    //               onChange={toggleSelectAll}
    //             />
    //           </th>
    //           <th className="py-3 px-4">User</th>
    //           <th className="py-3 px-4">Role</th>
    //           <th className="py-3 px-4">Status</th>
    //           <th className="py-3 px-4">Joined</th>
    //           <th className="py-3 px-4 text-right">Actions</th>
    //         </tr>
    //       </thead>
    //       <tbody>
    //         {filtered.length === 0 ? (
    //           <tr>
    //             <td colSpan={6} className="py-10 text-center text-gray-500">
    //               No users found.
    //             </td>
    //           </tr>
    //         ) : (
    //           filtered.map((u) => (
    //             <tr key={u.id} className="border-t">
    //               <td className="py-3 px-4">
    //                 <input
    //                   type="checkbox"
    //                   checked={selectedIds.includes(u.id)}
    //                   onChange={() => toggleSelect(u.id)}
    //                 />
    //               </td>
    //               <td className="py-3 px-4">
    //                 <div className="font-semibold text-gray-900">{u.name}</div>
    //                 <div className="text-xs text-gray-500">{u.email}</div>
    //               </td>
    //               <td className="py-3 px-4">
    //                 <div className="inline-flex items-center gap-2">
    //                   <UserCog className="w-4 h-4 text-emerald-600" />
    //                   <select
    //                     value={u.role}
    //                     onChange={(e) => changeRole(u.id, e.target.value)}
    //                     className="text-sm border rounded px-2 py-1 focus:ring-2 focus:ring-emerald-500"
    //                   >
    //                     {ROLES.filter((r) => r !== "All").map((r) => (
    //                       <option key={r} value={r}>
    //                         {r}
    //                       </option>
    //                     ))}
    //                   </select>
    //                 </div>
    //               </td>
    //               <td className="py-3 px-4">
    //                 <span
    //                   className={`px-2 py-1 rounded-full text-xs ${
    //                     u.blocked ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
    //                   }`}
    //                 >
    //                   {u.blocked ? "Blocked" : "Active"}
    //                 </span>
    //               </td>
    //               <td className="py-3 px-4">{u.joined}</td>
    //               <td className="py-3 px-4">
    //                 <div className="flex items-center gap-2 justify-end">
    //                   <button
    //                     onClick={() =>
    //                       addNotification(`Email sent to ${u.email}`, "success")
    //                     }
    //                     className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-100 text-sm"
    //                     title="Email user"
    //                   >
    //                     <Mail className="w-4 h-4" /> Email
    //                   </button>
    //                   {u.blocked ? (
    //                     <button
    //                       onClick={() => unblockUser(u.id)}
    //                       className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm hover:brightness-110"
    //                       title="Unblock"
    //                     >
    //                       <CheckCircle2 className="w-4 h-4" /> Unblock
    //                     </button>
    //                   ) : (
    //                     <button
    //                       onClick={() => blockUser(u.id)}
    //                       className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-sm hover:brightness-110"
    //                       title="Block"
    //                     >
    //                       <UserMinus className="w-4 h-4" /> Block
    //                     </button>
    //                   )}
    //                 </div>
    //               </td>
    //             </tr>
    //           ))
    //         )}
    //       </tbody>
    //     </table>
    //   </div>

    //   {/* Invite Modal */}
    //   {inviteOpen ? (
    //     <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
    //       <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
    //         <div className="p-4 border-b flex items-center justify-between">
    //           <h3 className="font-semibold">Invite User</h3>
    //           <button onClick={() => setInviteOpen(false)} className="text-gray-600">✕</button>
    //         </div>
    //         <form onSubmit={sendInvite} className="p-4 space-y-4">
    //           <div>
    //             <label className="block text-sm text-gray-600 mb-1">Email</label>
    //             <input
    //               value={invite.email}
    //               onChange={(e) => setInvite((f) => ({ ...f, email: e.target.value }))}
    //               placeholder="name@company.com"
    //               className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
    //             />
    //           </div>
    //           <div>
    //             <label className="block text-sm text-gray-600 mb-1">Role</label>
    //             <select
    //               value={invite.role}
    //               onChange={(e) => setInvite((f) => ({ ...f, role: e.target.value }))}
    //               className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
    //             >
    //               {ROLES.filter((r) => r !== "All").map((r) => (
    //                 <option key={r} value={r}>
    //                   {r}
    //                 </option>
    //               ))}
    //             </select>
    //           </div>
    //           <div className="flex items-center justify-end gap-3 pt-2">
    //             <button
    //               type="button"
    //               onClick={() => setInviteOpen(false)}
    //               className="px-4 py-2 rounded-lg border hover:bg-gray-100"
    //             >
    //               Cancel
    //             </button>
    //             <button
    //               type="submit"
    //               className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:brightness-110"
    //             >
    //               <UserPlus className="w-4 h-4" /> Send Invite
    //             </button>
    //           </div>
    //         </form>
    //       </div>
    //     </div>
    //   ) : null}
    // </div>
    <div className="space-y-6">
  {/* Header */}
  <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <h1 className="text-3xl font-bold text-white">User Management</h1>
      <p className="text-gray-400 mt-1">
        Manage roles, status, and invites across the registry.
      </p>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={openInvite}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:brightness-110"
      >
        <UserPlus className="w-4 h-4" /> Invite User
      </button>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 bg-[#1a1a1a] text-gray-300">
        <Shield className="w-4 h-4 text-emerald-400" /> Admin Tools
      </div>
    </div>
  </header>

  {/* Toolbar */}
  <div className="bg-[#1a1a1a] rounded-2xl shadow p-4 flex flex-col md:flex-row md:items-center gap-3 border border-gray-800">
    <div className="relative flex-1">
      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search name or email"
        className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#121110] text-gray-200 border border-gray-700 focus:ring-2 focus:ring-emerald-500"
      />
    </div>

    <div className="flex items-center gap-2">
      <Filter className="w-4 h-4 text-gray-400" />
      <select
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value)}
        className="py-2 px-3 rounded-lg bg-[#121110] text-gray-200 border border-gray-700 focus:ring-2 focus:ring-emerald-500"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    </div>

    <div className="flex items-center gap-2">
      <button
        onClick={bulkBlock}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-700 bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a]"
      >
        <Ban className="w-4 h-4 text-rose-400" /> Block Selected
      </button>
      <button
        onClick={bulkUnblock}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-700 bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a]"
      >
        <Unlock className="w-4 h-4 text-emerald-400" /> Unblock Selected
      </button>
    </div>
  </div>

  {/* Table/Grid */}
  <div className="bg-[#1a1a1a] rounded-2xl shadow overflow-hidden border border-gray-800">
    <table className="w-full text-left">
      <thead className="bg-[#121110] text-gray-400 text-sm">
        <tr>
          <th className="py-3 px-4">
            <input
              type="checkbox"
              checked={selectedIds.length === filtered.length && filtered.length > 0}
              onChange={toggleSelectAll}
            />
          </th>
          <th className="py-3 px-4">User</th>
          <th className="py-3 px-4">Role</th>
          <th className="py-3 px-4">Status</th>
          <th className="py-3 px-4">Joined</th>
          <th className="py-3 px-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {filtered.length === 0 ? (
          <tr>
            <td colSpan={6} className="py-10 text-center text-gray-500">
              No users found.
            </td>
          </tr>
        ) : (
          filtered.map((u) => (
            <tr
             key={u.id}
             className="border border-gray-800 hover:border-teal-500 hover:shadow-[0_0_8px_#14b8a6] transition">
              <td className="py-3 px-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(u.id)}
                  onChange={() => toggleSelect(u.id)}
                />
              </td>
              <td className="py-3 px-4">
                <div className="font-semibold text-white">{u.name}</div>
                <div className="text-xs text-gray-500">{u.email}</div>
              </td>
              <td className="py-3 px-4">
                <div className="inline-flex items-center gap-2">
                  <UserCog className="w-4 h-4 text-emerald-400" />
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className="text-sm border border-gray-700 bg-[#121110] text-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-emerald-500"
                  >
                    {ROLES.filter((r) => r !== "All").map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </td>
              <td className="py-3 px-4">
                <span
                  className={`inline-flex items-center justify-center whitespace-nowrap min-w-[100px] px-3 py-1 rounded-full text-xs ${
                    u.blocked
                      ? "bg-rose-900/40 text-rose-400"
                      : "bg-emerald-900/40 text-emerald-400"
                  }`}
                >
                  {u.blocked ? "Blocked" : "Active"}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-300">{u.joined}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() =>
                      addNotification(`Email sent to ${u.email}`, "success")
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-700 bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a] text-sm"
                    title="Email user"
                  >
                    <Mail className="w-4 h-4 text-emerald-400" /> Email
                  </button>
                  {u.blocked ? (
                    <button
                      onClick={() => unblockUser(u.id)}
                      className="inline-flex items-center gap-1 px-4 py-1 rounded-lg 
                     border border-gray-700 text-emerald-600 text-sm 
                     hover:shadow-[0_0_10px_#059669] transition"
                      title="Unblock"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Unblock
                    </button>
                  ) : (
                    <button
                      onClick={() => blockUser(u.id)}
                      className="inline-flex items-center gap-1 px-4 py-1 rounded-lg 
                     border border-gray-700 text-rose-400 text-sm 
                     hover:shadow-[0_0_10px_#e11d48] transition"
                      title="Block"
                    >
                      <UserMinus className="w-4 h-4" /> Block
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>

  {/* Invite Modal */}
  {inviteOpen ? (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-800">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-white">Invite User</h3>
          <button onClick={() => setInviteOpen(false)} className="text-gray-400">
            ✕
          </button>
        </div>
        <form onSubmit={sendInvite} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              value={invite.email}
              onChange={(e) =>
                setInvite((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="name@company.com"
              className="w-full px-3 py-2 rounded-lg bg-[#121110] text-gray-200 border border-gray-700 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Role</label>
            <select
              value={invite.role}
              onChange={(e) =>
                setInvite((f) => ({ ...f, role: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg bg-[#121110] text-gray-200 border border-gray-700 focus:ring-2 focus:ring-emerald-500"
            >
              {ROLES.filter((r) => r !== "All").map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setInviteOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-700 bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:brightness-110"
            >
              <UserPlus className="w-4 h-4" /> Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null}
</div>

  );
}