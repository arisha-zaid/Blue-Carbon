import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const COMMUNITY_TYPES = [
  "Indigenous Community",
  "Fishing Community",
  "Coastal Village",
  "Agricultural Community",
  "Conservation Group",
  "Local NGO",
  "Cooperative Society",
  "Self Help Group",
  "Other",
];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    communityName: "",
    communityType: "Coastal Village",
    description: "",
    location: { address: "", district: "", state: "" },
    demographics: { totalPopulation: 1, totalHouseholds: 1 },
    contactInfo: { primaryContact: { name: "", phone: "" } },
  });

  const update = (path, value) => {
    setForm((prev) => {
      const draft = structuredClone(prev);
      const keys = path.split(".");
      let cursor = draft;
      for (let i = 0; i < keys.length - 1; i++) cursor = cursor[keys[i]];
      cursor[keys[keys.length - 1]] = value;
      return draft;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      // Backend fills userId via auth; provide minimal required fields
      const payload = {
        communityName: form.communityName,
        communityType: form.communityType,
        description: form.description || "Community profile",
        location: {
          address: form.location.address,
          district: form.location.district,
          state: form.location.state,
        },
        demographics: {
          totalPopulation: Number(form.demographics.totalPopulation) || 1,
          totalHouseholds: Number(form.demographics.totalHouseholds) || 1,
        },
        contactInfo: {
          primaryContact: {
            name: form.contactInfo.primaryContact.name,
            phone: form.contactInfo.primaryContact.phone,
          },
        },
      };

      const res = await api.createCommunityProfile(payload);
      if (res?.success) {
        navigate("/community", { replace: true });
      } else {
        setError(res?.message || "Failed to create profile");
      }
    } catch (err) {
      setError(err?.message || "Failed to create profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    // <div className="max-w-3xl mx-auto">
    //   <h1 className="text-2xl font-bold mb-1">Create Community Profile</h1>
    //   <p className="text-gray-600 mb-6">Please provide basic details to get started.</p>

    //   {error ? (
    //     <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
    //   ) : null}

    //   <form onSubmit={submit} className="space-y-5 bg-white rounded-2xl shadow p-6">
    //     <div>
    //       <label className="block text-sm text-gray-700 mb-1">Community Name</label>
    //       <input
    //         value={form.communityName}
    //         onChange={(e) => update("communityName", e.target.value)}
    //         className="w-full px-3 py-2 border rounded-lg"
    //         required
    //       />
    //     </div>

    //     <div>
    //       <label className="block text-sm text-gray-700 mb-1">Community Type</label>
    //       <select
    //         value={form.communityType}
    //         onChange={(e) => update("communityType", e.target.value)}
    //         className="w-full px-3 py-2 border rounded-lg"
    //         required
    //       >
    //         {COMMUNITY_TYPES.map((t) => (
    //           <option key={t} value={t}>{t}</option>
    //         ))}
    //       </select>
    //     </div>

    //     <div>
    //       <label className="block text-sm text-gray-700 mb-1">Description</label>
    //       <textarea
    //         value={form.description}
    //         onChange={(e) => update("description", e.target.value)}
    //         className="w-full px-3 py-2 border rounded-lg"
    //         rows={3}
    //         placeholder="Brief description"
    //         required
    //       />
    //     </div>

    //     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    //       <div>
    //         <label className="block text-sm text-gray-700 mb-1">Address</label>
    //         <input
    //           value={form.location.address}
    //           onChange={(e) => update("location.address", e.target.value)}
    //           className="w-full px-3 py-2 border rounded-lg"
    //           required
    //         />
    //       </div>
    //       <div>
    //         <label className="block text-sm text-gray-700 mb-1">District</label>
    //         <input
    //           value={form.location.district}
    //           onChange={(e) => update("location.district", e.target.value)}
    //           className="w-full px-3 py-2 border rounded-lg"
    //           required
    //         />
    //       </div>
    //       <div>
    //         <label className="block text-sm text-gray-700 mb-1">State</label>
    //         <input
    //           value={form.location.state}
    //           onChange={(e) => update("location.state", e.target.value)}
    //           className="w-full px-3 py-2 border rounded-lg"
    //           required
    //         />
    //       </div>
    //     </div>

    //     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //       <div>
    //         <label className="block text-sm text-gray-700 mb-1">Total Population</label>
    //         <input
    //           type="number"
    //           min={1}
    //           value={form.demographics.totalPopulation}
    //           onChange={(e) => update("demographics.totalPopulation", e.target.value)}
    //           className="w-full px-3 py-2 border rounded-lg"
    //           required
    //         />
    //       </div>
    //       <div>
    //         <label className="block text-sm text-gray-700 mb-1">Total Households</label>
    //         <input
    //           type="number"
    //           min={1}
    //           value={form.demographics.totalHouseholds}
    //           onChange={(e) => update("demographics.totalHouseholds", e.target.value)}
    //           className="w-full px-3 py-2 border rounded-lg"
    //           required
    //         />
    //       </div>
    //     </div>

    //     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //       <div>
    //         <label className="block text-sm text-gray-700 mb-1">Primary Contact Name</label>
    //         <input
    //           value={form.contactInfo.primaryContact.name}
    //           onChange={(e) => update("contactInfo.primaryContact.name", e.target.value)}
    //           className="w-full px-3 py-2 border rounded-lg"
    //           required
    //         />
    //       </div>
    //       <div>
    //         <label className="block text-sm text-gray-700 mb-1">Primary Contact Phone</label>
    //         <input
    //           value={form.contactInfo.primaryContact.phone}
    //           onChange={(e) => update("contactInfo.primaryContact.phone", e.target.value)}
    //           className="w-full px-3 py-2 border rounded-lg"
    //           placeholder="+91xxxxxxxxxx"
    //           required
    //         />
    //       </div>
    //     </div>

    //     <div className="flex items-center gap-3">
    //       <button
    //         type="submit"
    //         disabled={saving}
    //         className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:brightness-110 disabled:opacity-60"
    //       >
    //         {saving ? "Creating..." : "Create Profile"}
    //       </button>
    //       <button
    //         type="button"
    //         className="px-4 py-2 rounded-lg border"
    //         onClick={() => navigate(-1)}
    //       >
    //         Cancel
    //       </button>
    //     </div>
    //   </form>
    // </div>
    <div className="max-w-3xl mx-auto">
  <h1 className="text-2xl font-bold mb-1 text-gray-100">Create Community Profile</h1>
  <p className="text-gray-400 mb-6">Please provide basic details to get started.</p>

  {error ? (
    <div className="mb-4 p-3 rounded bg-red-900/40 text-red-400 border border-red-700">
      {error}
    </div>
  ) : null}

  <form
    onSubmit={submit}
    className="space-y-5 bg-[#121110] border border-gray-800 rounded-2xl shadow-lg p-6"
  >
    <div>
      <label className="block text-sm text-gray-400 mb-1">Community Name</label>
      <input
        value={form.communityName}
        onChange={(e) => update("communityName", e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#1a1a1a] text-gray-200 placeholder-gray-500  focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0_0_6px_#14b8a6] hover:border-teal-500 hover:shadow-[0_0_6px_#14b8a6] transition"
        required
      />
    </div>

    <div>
      <label className="block text-sm text-gray-400 mb-1">Community Type</label>
      <select
        value={form.communityType}
        onChange={(e) => update("communityType", e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#1a1a1a] text-gray-200  focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0_0_6px_#14b8a6] 
  hover:border-teal-500 hover:shadow-[0_0_6px_#14b8a6] transition"
        required
      >
        {COMMUNITY_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm text-gray-400 mb-1">Description</label>
      <textarea
        value={form.description}
        onChange={(e) => update("description", e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#1a1a1a] text-gray-200 placeholder-gray-500   focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0_0_6px_#14b8a6] 
  hover:border-teal-500 hover:shadow-[0_0_6px_#14b8a6] transition"
        rows={3}
        placeholder="Brief description"
        required
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Address</label>
        <input
          value={form.location.address}
          onChange={(e) => update("location.address", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#1a1a1a] text-gray-200  focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0_0_6px_#14b8a6] hover:border-teal-500 hover:shadow-[0_0_6px_#14b8a6] transition"
          required
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">District</label>
        <input
          value={form.location.district}
          onChange={(e) => update("location.district", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#1a1a1a] text-gray-200 focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0_0_6px_#14b8a6] hover:border-teal-500 hover:shadow-[0_0_6px_#14b8a6] transition"
          required
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">State</label>
        <input
          value={form.location.state}
          onChange={(e) => update("location.state", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#1a1a1a] text-gray-200 focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0_0_6px_#14b8a6] hover:border-teal-500 hover:shadow-[0_0_6px_#14b8a6] transition"
          required
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Total Population</label>
        <input
          type="number"
          min={1}
          value={form.demographics.totalPopulation}
          onChange={(e) => update("demographics.totalPopulation", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#1a1a1a] text-gray-200 focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0_0_6px_#14b8a6] hover:border-teal-500 hover:shadow-[0_0_6px_#14b8a6] transition"
          required
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Total Households</label>
        <input
          type="number"
          min={1}
          value={form.demographics.totalHouseholds}
          onChange={(e) => update("demographics.totalHouseholds", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#1a1a1a] text-gray-200 focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0_0_6px_#14b8a6] hover:border-teal-500 hover:shadow-[0_0_6px_#14b8a6] transition"
          required
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Primary Contact Name</label>
        <input
          value={form.contactInfo.primaryContact.name}
          onChange={(e) => update("contactInfo.primaryContact.name", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#1a1a1a] text-gray-200 focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0_0_6px_#14b8a6] hover:border-teal-500 hover:shadow-[0_0_6px_#14b8a6] transition"
          required
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Primary Contact Phone</label>
        <input
          value={form.contactInfo.primaryContact.phone}
          onChange={(e) => update("contactInfo.primaryContact.phone", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#1a1a1a] text-gray-200 placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0_0_6px_#14b8a6] hover:border-teal-500 hover:shadow-[0_0_6px_#14b8a6] transition"
          placeholder="+91xxxxxxxxxx"
          required
        />
      </div>
    </div>

    <div className="flex items-center gap-3">
      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 rounded-lg border border-emerald-800 text-emerald-800 hover:brightness-110  hover:border-emerald-500 hover:text-emerald-500 transition"
      >
        {saving ? "Creating..." : "Create Profile"}
      </button>
      <button
        type="button"
        className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:border-rose-500 hover:text-rose-500 transition"
        onClick={() => navigate(-1)}
      >
        Cancel
      </button>
    </div>
  </form>
</div>

  );
}