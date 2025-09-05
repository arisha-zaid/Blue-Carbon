// src/pages/admin/ProjectApproval.jsx
import React, { useMemo, useState } from "react";
import { useNotification } from "../../context/NotificationContext";
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  BadgeAlert,
} from "lucide-react";

const STATUSES = ["All", "Pending MRV", "MRV Complete", "Approved", "Blockchain Anchored"];
const TYPES = ["All", "Mangroves", "Seagrass", "Wetlands"];

const MOCK = [
  {
    id: "PRJ-1107",
    name: "Mangrove Revival – Bay East",
    owner: "Alice Johnson",
    type: "Mangroves",
    location: "Odisha, IN",
    submittedAt: "2025-09-02",
    status: "MRV Complete",
    predictedCO2: 520,
    files: [
      { name: "satellite_imagery.pdf", size: 1240_000 },
      { name: "field_survey.csv", size: 86_000 },
    ],
    description:
      "Restoration of degraded mangrove patches with community participation and periodic MRV.",
  },
  {
    id: "PRJ-1099",
    name: "Wetland Horizon – Estuary",
    owner: "David Lee",
    type: "Wetlands",
    location: "Kerala, IN",
    submittedAt: "2025-08-31",
    status: "Pending MRV",
    predictedCO2: 310,
    files: [{ name: "project_plan.docx", size: 44_000 }],
    description: "Conservation of estuarine wetlands using community stewardship models.",
  },
  {
    id: "PRJ-1093",
    name: "Seagrass Bloom – West Coast",
    owner: "Meera N",
    type: "Seagrass",
    location: "Goa, IN",
    submittedAt: "2025-08-29",
    status: "MRV Complete",
    predictedCO2: 420,
    files: [
      { name: "drone_flyover.mp4", size: 8_400_000 },
      { name: "mrv_checklist.pdf", size: 320_000 },
    ],
    description:
      "Seagrass meadow expansion with periodic biomass sampling and water quality tracking.",
  },
];

export default function ProjectApproval() {
  const { addNotification } = useNotification();
  const [rows, setRows] = useState(MOCK);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [ptype, setPtype] = useState("All");
  const [sortBy, setSortBy] = useState({ key: "submittedAt", dir: "desc" }); // asc|desc
  const [selectedIds, setSelectedIds] = useState([]);
  const [drawer, setDrawer] = useState(null); // selected project for right drawer
  const [action, setAction] = useState({ open: false, mode: null, reason: "" }); // approve/reject modal

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows.filter((r) => {
      const matchQ =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.owner.toLowerCase().includes(q) ||
        (r.location || "").toLowerCase().includes(q);
      const matchS = status === "All" ? true : r.status === status;
      const matchT = ptype === "All" ? true : r.type === ptype;
      return matchQ && matchS && matchT;
    });
    const dir = sortBy.dir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      const ka = a[sortBy.key];
      const kb = b[sortBy.key];
      if (ka < kb) return -1 * dir;
      if (ka > kb) return 1 * dir;
      return 0;
    });
    return list;
  }, [rows, query, status, ptype, sortBy]);

  const toggleAll = () => {
    setSelectedIds((s) => (s.length === filtered.length ? [] : filtered.map((r) => r.id)));
  };
  const toggleOne = (id) => {
    setSelectedIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const openDrawer = (row) => setDrawer(row);
  const closeDrawer = () => setDrawer(null);

  const openAction = (mode, preset) => {
    setAction({ open: true, mode, reason: preset || "" });
  };
  const closeAction = () => setAction({ open: false, mode: null, reason: "" });

  const doApprove = (ids) => {
    setRows((prev) =>
      prev.map((r) => (ids.includes(r.id) ? { ...r, status: "Approved" } : r))
    );
    addNotification(`Approved ${ids.length} project(s) ✅`, "success");
  };

  const doReject = (ids, reason) => {
    setRows((prev) =>
      prev.map((r) => (ids.includes(r.id) ? { ...r, status: "Pending MRV" } : r))
    );
    addNotification(
      `Requested changes for ${ids.length} project(s). Reason: ${reason || "N/A"}`,
      "info"
    );
  };

  const confirmAction = () => {
    const targetIds = selectedIds.length ? selectedIds : drawer ? [drawer.id] : [];
    if (!targetIds.length) return;
    if (action.mode === "approve") doApprove(targetIds);
    if (action.mode === "reject") doReject(targetIds, action.reason);
    setSelectedIds([]);
    closeAction();
    closeDrawer();
  };

  const setSort = (key) => {
    setSortBy((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Project Approval</h1>
          <p className="text-gray-600 mt-1">
            Review MRV, approve projects, or request changes with clear reasoning.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openAction("approve")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:brightness-110 disabled:opacity-50"
            disabled={selectedIds.length === 0}
          >
            <CheckCircle2 className="w-4 h-4" /> Approve Selected
          </button>
          <button
            onClick={() => openAction("reject")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 text-white hover:brightness-110 disabled:opacity-50"
            disabled={selectedIds.length === 0}
          >
            <XCircle className="w-4 h-4" /> Request Changes
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow p-4 flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by id, name, owner, or location"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="py-2 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <select
            value={ptype}
            onChange={(e) => setPtype(e.target.value)}
            className="py-2 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="py-3 px-4">
                <input
                  type="checkbox"
                  onChange={toggleAll}
                  checked={selectedIds.length === filtered.length && filtered.length > 0}
                />
              </th>
              <Th label="Project" onSort={() => setSort("name")} active={sortBy.key === "name"} dir={sortBy.dir} />
              <Th label="Owner" onSort={() => setSort("owner")} active={sortBy.key === "owner"} dir={sortBy.dir} />
              <Th label="Type" onSort={() => setSort("type")} active={sortBy.key === "type"} dir={sortBy.dir} />
              <Th label="Location" onSort={() => setSort("location")} active={sortBy.key === "location"} dir={sortBy.dir} />
              <Th
                label="Pred. CO₂ (t/yr)"
                onSort={() => setSort("predictedCO2")}
                active={sortBy.key === "predictedCO2"}
                dir={sortBy.dir}
              />
              <Th
                label="Submitted"
                onSort={() => setSort("submittedAt")}
                active={sortBy.key === "submittedAt"}
                dir={sortBy.dir}
              />
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-gray-500">
                  No projects match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(r.id)}
                      onChange={() => toggleOne(r.id)}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.id}</div>
                  </td>
                  <td className="py-3 px-4">{r.owner}</td>
                  <td className="py-3 px-4">{r.type}</td>
                  <td className="py-3 px-4">{r.location}</td>
                  <td className="py-3 px-4">{r.predictedCO2}</td>
                  <td className="py-3 px-4">{r.submittedAt}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        r.status === "MRV Complete"
                          ? "bg-emerald-50 text-emerald-700"
                          : r.status === "Pending MRV"
                          ? "bg-amber-50 text-amber-700"
                          : r.status === "Approved"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openDrawer(r)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-100 text-sm"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
                      {r.status === "MRV Complete" ? (
                        <>
                          <button
                            onClick={() => openAction("approve")}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm hover:brightness-110"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Approve
                          </button>
                          <button
                            onClick={() => openAction("reject", "Need clearer MRV evidence.")}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-sm hover:brightness-110"
                          >
                            <XCircle className="w-4 h-4" /> Request Changes
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                          <BadgeAlert className="w-4 h-4" /> Await MRV
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      {drawer ? (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[520px] bg-white shadow-2xl z-40 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="font-semibold">Project Details</div>
            <button
              onClick={closeDrawer}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-100"
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> Close
            </button>
          </div>

          <div className="p-5 space-y-5 overflow-auto">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{drawer.name}</div>
                <div className="text-xs text-gray-500">{drawer.id}</div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  drawer.status === "MRV Complete"
                    ? "bg-emerald-50 text-emerald-700"
                    : drawer.status === "Pending MRV"
                    ? "bg-amber-50 text-amber-700"
                    : drawer.status === "Approved"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {drawer.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <Meta label="Owner" value={drawer.owner} />
              <Meta label="Type" value={drawer.type} />
              <Meta label="Location" value={drawer.location} />
              <Meta label="Submitted" value={drawer.submittedAt} />
              <Meta label="Predicted CO₂ (t/yr)" value={drawer.predictedCO2} />
            </div>

            <div>
              <div className="text-sm text-gray-600">Description</div>
              <p className="mt-1 text-gray-800">{drawer.description}</p>
            </div>

            <div>
              <div className="text-sm text-gray-600">Files</div>
              <ul className="mt-2 space-y-2">
                {drawer.files?.map((f, i) => (
                  <li key={i} className="text-sm text-gray-800">
                    {f.name}{" "}
                    <span className="text-xs text-gray-500">
                      ({(f.size / 1024).toFixed(1)} KB)
                    </span>
                  </li>
                ))}
                {!drawer.files?.length && (
                  <li className="text-sm text-gray-500">No files attached</li>
                )}
              </ul>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => openAction("approve")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:brightness-110"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve
              </button>
              <button
                onClick={() => openAction("reject")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 text-white hover:brightness-110"
              >
                <XCircle className="w-4 h-4" /> Request Changes
              </button>
              <button
                onClick={closeDrawer}
                className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Action Modal */}
      {action.open ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b font-semibold">
              {action.mode === "approve" ? "Approve Project(s)" : "Request Changes"}
            </div>
            <div className="p-4 space-y-4">
              {action.mode === "reject" ? (
                <>
                  <label className="block text-sm text-gray-600 mb-1">Reason</label>
                  <textarea
                    value={action.reason}
                    onChange={(e) => setAction((a) => ({ ...a, reason: e.target.value }))}
                    rows={3}
                    placeholder="Provide clear, actionable feedback"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </>
              ) : (
                <div className="text-sm text-gray-700">
                  You are about to approve the selected project(s). This will mark them as
                  Approved and ready for issuance/anchoring workflows.
                </div>
              )}
            </div>
            <div className="p-4 border-t flex items-center justify-end gap-3">
              <button
                onClick={closeAction}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white ${
                  action.mode === "approve" ? "bg-emerald-600" : "bg-rose-600"
                } hover:brightness-110`}
              >
                {action.mode === "approve" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Confirm Approve
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" /> Send Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* Helpers */
function Th({ label, onSort, active, dir }) {
  return (
    <th className="py-3 px-4">
      <button
        onClick={onSort}
        className={`inline-flex items-center gap-1 ${active ? "text-gray-900" : "text-gray-600"}`}
        title="Sort"
      >
        {label} {active ? (dir === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />) : null}
      </button>
    </th>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-semibold text-gray-900">{value ?? "-"}</div>
    </div>
  );
}