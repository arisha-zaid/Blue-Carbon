// src/pages/government/Policies.jsx
import React, { useMemo, useState } from "react";
import { useNotification } from "../../context/NotificationContext";
import { Search, Filter, Edit2, Trash2, Plus, CheckCircle2, XCircle } from "lucide-react";

const INITIAL_POLICIES = [
  {
    id: "POL-001",
    title: "MRV Standard v2.1",
    category: "Verification",
    status: "Active",
    effectiveFrom: "2025-01-01",
    summary:
      "Updated MRV requirements for coastal blue carbon projects, including imagery cadence and sampling density.",
  },
  {
    id: "POL-002",
    title: "Anchor Threshold Policy",
    category: "Blockchain",
    status: "Active",
    effectiveFrom: "2025-02-10",
    summary: "Defines minimum data completeness required prior to on-chain anchoring.",
  },
  {
    id: "POL-003",
    title: "Project Naming Guidelines",
    category: "Compliance",
    status: "Draft",
    effectiveFrom: "2025-03-01",
    summary: "Naming rules for registry display including locale and language constraints.",
  },
];

const CATEGORIES = ["All", "Verification", "Blockchain", "Compliance", "Other"];
const STATUS = ["Active", "Draft", "Deprecated"];

export default function Policies() {
  const { addNotification } = useNotification();
  const [policies, setPolicies] = useState(INITIAL_POLICIES);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [editing, setEditing] = useState(null); // policy object or null
  const [form, setForm] = useState(getEmptyForm());

  function getEmptyForm() {
    return {
      id: "",
      title: "",
      category: "Verification",
      status: "Draft",
      effectiveFrom: "",
      summary: "",
    };
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return policies.filter((p) => {
      const matchesQuery =
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q);
      const matchesCategory = category === "All" ? true : p.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [policies, query, category]);

  const startCreate = () => {
    setEditing(null);
    setForm(getEmptyForm());
  };

  const startEdit = (policy) => {
    setEditing(policy);
    setForm({ ...policy });
  };

  const cancel = () => {
    setEditing(null);
    setForm(getEmptyForm());
  };

  const submit = (e) => {
    e.preventDefault();
    if (!(form.title && form.category && form.status && form.effectiveFrom)) {
      addNotification("Please fill all required fields.", "error");
      return;
    }

    if (editing) {
      setPolicies((prev) => prev.map((p) => (p.id === editing.id ? { ...form } : p)));
      addNotification("Policy updated ✅", "success");
      setEditing(null);
    } else {
      // generate a simple ID
      const id = `POL-${Math.floor(100 + Math.random() * 900)}`;
      setPolicies((prev) => [{ ...form, id }, ...prev]);
      addNotification("Policy created ✅", "success");
    }
    setForm(getEmptyForm());
  };

  const remove = (id) => {
    setPolicies((prev) => prev.filter((p) => p.id !== id));
    addNotification("Policy removed 🗑️", "success");
    if (editing?.id === id) {
      cancel();
    }
  };

  const toggleActive = (id) => {
    setPolicies((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: p.status === "Active" ? "Deprecated" : "Active",
            }
          : p
      )
    );
    addNotification("Policy status updated 🔁", "success");
  };

  return (
    // <div className="space-y-6">
    //   {/* Header */}
    //   <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    //     <div>
    //       <h1 className="text-3xl font-bold">Policies</h1>
    //       <p className="text-gray-600 mt-1">Create, update, and manage compliance frameworks.</p>
    //     </div>
    //     <div className="flex items-center gap-3">
    //       <button
    //         onClick={startCreate}
    //         className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:brightness-110"
    //       >
    //         <Plus className="w-4 h-4" /> New Policy
    //       </button>
    //     </div>
    //   </header>

    //   {/* Filters */}
    //   <div className="flex flex-col md:flex-row md:items-center gap-3">
    //     <div className="relative">
    //       <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
    //       <input
    //         value={query}
    //         onChange={(e) => setQuery(e.target.value)}
    //         placeholder="Search by ID, title, or summary"
    //         className="pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 w-72"
    //       />
    //     </div>
    //     <div className="flex items-center gap-2">
    //       <Filter className="w-4 h-4 text-gray-600" />
    //       <select
    //         value={category}
    //         onChange={(e) => setCategory(e.target.value)}
    //         className="py-2 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
    //       >
    //         {CATEGORIES.map((c) => (
    //           <option key={c} value={c}>
    //             {c}
    //           </option>
    //         ))}
    //       </select>
    //     </div>
    //   </div>

    //   {/* List */}
    //   <div className="bg-white rounded-2xl shadow overflow-hidden">
    //     <table className="w-full text-left">
    //       <thead className="bg-gray-50 text-gray-600 text-sm">
    //         <tr>
    //           <th className="py-3 px-4">Policy</th>
    //           <th className="py-3 px-4">Category</th>
    //           <th className="py-3 px-4">Status</th>
    //           <th className="py-3 px-4">Effective From</th>
    //           <th className="py-3 px-4">Summary</th>
    //           <th className="py-3 px-4 text-right">Actions</th>
    //         </tr>
    //       </thead>
    //       <tbody>
    //         {filtered.length === 0 ? (
    //           <tr>
    //             <td colSpan={6} className="py-10 text-center text-gray-500">
    //               No policies found.
    //             </td>
    //           </tr>
    //         ) : (
    //           filtered.map((p) => (
    //             <tr key={p.id} className="border-t">
    //               <td className="py-3 px-4">
    //                 <div className="font-semibold text-gray-900">{p.title}</div>
    //                 <div className="text-xs text-gray-500">{p.id}</div>
    //               </td>
    //               <td className="py-3 px-4">{p.category}</td>
    //               <td className="py-3 px-4">
    //                 <span
    //                   className={`px-2 py-1 rounded-full text-xs ${
    //                     p.status === "Active"
    //                       ? "bg-green-50 text-green-700"
    //                       : p.status === "Draft"
    //                       ? "bg-amber-50 text-amber-700"
    //                       : "bg-gray-100 text-gray-700"
    //                   }`}
    //                 >
    //                   {p.status}
    //                 </span>
    //               </td>
    //               <td className="py-3 px-4">{p.effectiveFrom || "-"}</td>
    //               <td className="py-3 px-4">
    //                 <div className="text-sm text-gray-700 line-clamp-2">{p.summary}</div>
    //               </td>
    //               <td className="py-3 px-4">
    //                 <div className="flex items-center gap-2 justify-end">
    //                   <button
    //                     onClick={() => toggleActive(p.id)}
    //                     className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white text-sm ${
    //                       p.status === "Active" ? "bg-gray-700" : "bg-green-600"
    //                     }`}
    //                     title={p.status === "Active" ? "Deprecate" : "Activate"}
    //                   >
    //                     {p.status === "Active" ? (
    //                       <>
    //                         <XCircle className="w-4 h-4" /> Deprecate
    //                       </>
    //                     ) : (
    //                       <>
    //                         <CheckCircle2 className="w-4 h-4" /> Activate
    //                       </>
    //                     )}
    //                   </button>

    //                   <button
    //                     onClick={() => startEdit(p)}
    //                     className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-100 text-sm"
    //                     title="Edit"
    //                   >
    //                     <Edit2 className="w-4 h-4" /> Edit
    //                   </button>

    //                   <button
    //                     onClick={() => remove(p.id)}
    //                     className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600 text-white hover:brightness-110 text-sm"
    //                     title="Delete"
    //                   >
    //                     <Trash2 className="w-4 h-4" /> Delete
    //                   </button>
    //                 </div>
    //               </td>
    //             </tr>
    //           ))
    //         )}
    //       </tbody>
    //     </table>
    //   </div>

    //   {/* Form */}
    //   <div className="bg-white rounded-2xl shadow p-6">
    //     <h3 className="font-semibold text-gray-900 mb-4">
    //       {editing ? "Edit Policy" : "Create Policy"}
    //     </h3>
    //     <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //       <div className="col-span-1">
    //         <label className="block text-sm text-gray-600 mb-1">Title</label>
    //         <input
    //           value={form.title}
    //           onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
    //           className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
    //           placeholder="e.g., MRV Standard v2.2"
    //           required
    //         />
    //       </div>
    //       <div className="col-span-1">
    //         <label className="block text-sm text-gray-600 mb-1">Category</label>
    //         <select
    //           value={form.category}
    //           onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
    //           className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
    //         >
    //           {CATEGORIES.filter((c) => c !== "All").map((c) => (
    //             <option key={c} value={c}>
    //               {c}
    //             </option>
    //           ))}
    //         </select>
    //       </div>

    //       <div className="col-span-1">
    //         <label className="block text-sm text-gray-600 mb-1">Status</label>
    //         <select
    //           value={form.status}
    //           onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
    //           className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
    //         >
    //           {STATUS.map((s) => (
    //             <option key={s} value={s}>
    //               {s}
    //             </option>
    //           ))}
    //         </select>
    //       </div>
    //       <div className="col-span-1">
    //         <label className="block text-sm text-gray-600 mb-1">Effective From</label>
    //         <input
    //           type="date"
    //           value={form.effectiveFrom}
    //           onChange={(e) => setForm((f) => ({ ...f, effectiveFrom: e.target.value }))}
    //           className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
    //           required
    //         />
    //       </div>

    //       <div className="col-span-1 md:col-span-2">
    //         <label className="block text-sm text-gray-600 mb-1">Summary</label>
    //         <textarea
    //           value={form.summary}
    //           onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
    //           rows={3}
    //           className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
    //           placeholder="Short description of policy scope and rules"
    //         />
    //       </div>

    //       <div className="col-span-1 md:col-span-2 flex items-center gap-3">
    //         <button
    //           type="submit"
    //           className="px-4 py-2 rounded-lg bg-green-600 text-white hover:brightness-110"
    //         >
    //           {editing ? "Update Policy" : "Create Policy"}
    //         </button>
    //         {editing && (
    //           <button
    //             type="button"
    //             onClick={cancel}
    //             className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
    //           >
    //             Cancel
    //           </button>
    //         )}
    //       </div>
    //     </form>
    //   </div>
    // </div>

    <div className="space-y-6 text-gray-200">
  {/* Header */}
  <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <h1 className="text-3xl font-bold text-white">Policies</h1>
      <p className="text-gray-400 mt-1">
        Create, update, and manage compliance frameworks.
      </p>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={startCreate}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-teal-600  text-teal-600 border border-teal-600 hover:bg-teal-600 hover:text-white transition cursor-pointer"
      >
        <Plus className="w-4 h-4" /> New Policy
      </button>
    </div>
  </header>

  {/* Filters */}
  <div className="flex flex-col md:flex-row md:items-center gap-3">
    <div className="relative">
      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by ID, title, or summary"
        className="pl-9 pr-3 py-2 rounded-lg border border-gray-700 bg-[#1a1a1a] text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500 w-72"
      />
    </div>
    <div className="flex items-center gap-2">
      <Filter className="w-4 h-4 text-gray-400" />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="py-2 px-3 rounded-lg border border-gray-700 bg-[#1a1a1a] text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  </div>

  {/* List */}
  <div className="bg-[#1a1a1a] rounded-2xl shadow overflow-hidden">
    <table className="w-full text-left">
      <thead className="bg-[#242424] text-gray-400 text-sm">
        <tr>
          <th className="py-3 px-4">Policy</th>
          <th className="py-3 px-4">Category</th>
          <th className="py-3 px-4">Status</th>
          <th className="py-3 px-4">Effective From</th>
          <th className="py-3 px-4">Summary</th>
          <th className="py-3 px-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {filtered.length === 0 ? (
          <tr>
            <td colSpan={6} className="py-10 text-center text-gray-500">
              No policies found.
            </td>
          </tr>
        ) : (
          filtered.map((p) => (
            <tr key={p.id} className="border border-gray-700  transition duration-300 hover:bg-[#222]"
>
              <td className="py-3 px-4">
                <div className="font-semibold text-white">{p.title}</div>
                <div className="text-xs text-gray-500">{p.id}</div>
              </td>
              <td className="py-3 px-4">{p.category}</td>
              <td className="py-3 px-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    p.status === "Active"
                      ? "bg-green-900 text-green-300"
                      : p.status === "Draft"
                      ? "bg-amber-900 text-amber-300"
                      : "bg-gray-800 text-gray-300"
                  }`}
                >
                  {p.status}
                </span>
              </td>
              <td className="py-3 px-4">{p.effectiveFrom || "-"}</td>
              <td className="py-3 px-4">
                <div className="text-sm text-gray-300 line-clamp-2">
                  {p.summary}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => toggleActive(p.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white text-sm ${
                      p.status === "Active" ? "border border-gray-700 hover:bg-gray-600" : 
                                   "border border-green-600 text-emerald-600 hover:bg-green-600 hover:text-white"
                    }`}
                    title={p.status === "Active" ? "Deprecate" : "Activate"}
                  >
                    {p.status === "Active" ? (
                      <>
                        <XCircle className="w-4 h-4 " /> Deprecate
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Activate
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => startEdit(p)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 text-sm"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>

                  <button
                    onClick={() => remove(p.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border  
                    border-rose-600 text-rose-600 cursor-pointer hover:bg-rose-600 hover:text-white  text-sm"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>

  {/* Form */}
  <div className="bg-[#1a1a1a] rounded-2xl shadow p-6">
    <h3 className="font-semibold text-white mb-4">
      {editing ? "Edit Policy" : "Create Policy"}
    </h3>
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="col-span-1">
        <label className="block text-sm text-gray-400 mb-1 ">Title</label>
        <input
          value={form.title}
          onChange={(e) =>
            setForm((f) => ({ ...f, title: e.target.value }))
          }
          className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#121212] text-gray-200 placeholder-gray-500 focus:ring-2  focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0px_0px_10px_#14b8a6]"
          placeholder="e.g., MRV Standard v2.2"
          required
        />
      </div>
      <div className="col-span-1">
        <label className="block text-sm text-gray-400 mb-1">Category</label>
        <select
          value={form.category}
          onChange={(e) =>
            setForm((f) => ({ ...f, category: e.target.value }))
          }
          className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#121212] text-gray-200 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0px_0px_10px_#14b8a6]"
        >
          {CATEGORIES.filter((c) => c !== "All").map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="col-span-1">
        <label className="block text-sm text-gray-400 mb-1">Status</label>
        <select
          value={form.status}
          onChange={(e) =>
            setForm((f) => ({ ...f, status: e.target.value }))
          }
          className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#121212] text-gray-200 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0px_0px_10px_#14b8a6]"
        >
          {STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="col-span-1">
        <label className="block text-sm text-gray-400 mb-1">Effective From</label>
        <input
          type="date"
          value={form.effectiveFrom}
          onChange={(e) =>
            setForm((f) => ({ ...f, effectiveFrom: e.target.value }))
          }
          className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#121212] text-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0px_0px_10px_#14b8a6]"
          required
        />
      </div>

      <div className="col-span-1 md:col-span-2">
        <label className="block text-sm text-gray-400 mb-1">Summary</label>
        <textarea
          value={form.summary}
          onChange={(e) =>
            setForm((f) => ({ ...f, summary: e.target.value }))
          }
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#121212] text-gray-200 placeholder-gray-500 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0px_0px_10px_#14b8a6]"
          placeholder="Short description of policy scope and rules"
        />
      

      </div>

      <div className="col-span-1 md:col-span-2 flex items-center gap-3">
        <button
          type="submit"
          className="px-4 py-2 rounded-lg text-teal-600  text-teal-600 border border-teal-600 hover:bg-teal-600 hover:text-white "
        >
          {editing ? "Update Policy" : "Create Policy"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={cancel}
            className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  </div>
</div>

  );
}