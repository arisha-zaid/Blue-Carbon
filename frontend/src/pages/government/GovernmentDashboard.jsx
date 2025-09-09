import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  BarChart3,
  FileSearch,
  BookMarked,
  Settings,
} from "lucide-react";

export default function GovernmentDashboard() {
  return (
    // <div className="space-y-8">
    //   <header className="flex items-center justify-between">
    //     <div>
    //       <h1 className="text-3xl font-bold">Government Dashboard</h1>
    //       <p className="text-gray-600 mt-1">Monitor, audit, and manage policies across projects.</p>
    //     </div>
    //     <div className="hidden md:flex items-center gap-3">
    //       <div className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium">
    //         Verified Registry
    //       </div>
    //       <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
    //         Live Monitoring
    //       </div>
    //     </div>
    //   </header>

    //   <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
    //     <StatCard title="Pending Audits" value="12" delta="+3 this week" color="bg-amber-500" />
    //     <StatCard title="Approved Projects" value="87" delta="+6 this month" color="bg-green-600" />
    //     <StatCard title="Anchored on Chain" value="64" delta="+4 this month" color="bg-blue-600" />
    //     <StatCard title="Policies Active" value="9" delta="2 under review" color="bg-purple-600" />
    //   </section>

    //   <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    //     <QuickCard
    //       icon={<BarChart3 className="w-5 h-5" />}
    //       title="Reports & Analytics"
    //       desc="View CO₂ reductions, project distribution, and trend insights."
    //       to="/government/reports"
    //       action="Open Reports"
    //     />
    //     <QuickCard
    //       icon={<FileSearch className="w-5 h-5" />}
    //       title="Audit Projects"
    //       desc="Run MRV checks, approve or request changes on submissions."
    //       to="/government/audit-projects"
    //       action="Go to Audits"
    //     />
    //     <QuickCard
    //       icon={<BookMarked className="w-5 h-5" />}
    //       title="Policies"
    //       desc="Create, publish, and update compliance frameworks."
    //       to="/government/policies"
    //       action="Manage Policies"
    //     />
    //   </section>

    //   <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    //     <div className="bg-white rounded-2xl shadow p-6">
    //       <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
    //         <ShieldCheck className="w-5 h-5 text-green-600" /> Compliance Snapshot
    //       </h3>
    //       <ul className="space-y-3 text-sm text-gray-700">
    //         <li className="flex items-center justify-between">
    //           <span>MRV-complete this month</span>
    //           <span className="font-semibold text-gray-900">18</span>
    //         </li>
    //         <li className="flex items-center justify-between">
    //           <span>Pending verifications</span>
    //           <span className="font-semibold text-gray-900">12</span>
    //         </li>
    //         <li className="flex items-center justify-between">
    //           <span>Non-compliance flags</span>
    //           <span className="font-semibold text-red-600">3</span>
    //         </li>
    //       </ul>
    //     </div>

    //     <div className="bg-white rounded-2xl shadow p-6">
    //       <h3 className="font-semibold text-gray-800 mb-4">Recent Actions</h3>
    //       <ul className="space-y-3 text-sm text-gray-700">
    //         <li>Approved: Seagrass Meadow #204</li>
    //         <li>Anchored: Mangrove Expansion #127</li>
    //         <li>Policy Updated: MRV v2.1 rollout</li>
    //       </ul>
    //     </div>

    //     <div className="bg-white rounded-2xl shadow p-6">
    //       <h3 className="font-semibold text-gray-800 mb-4">Quick Settings</h3>
    //       <Link
    //         to="/government/settings"
    //         className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:opacity-90"
    //       >
    //         <Settings className="w-4 h-4" /> Open Settings
    //       </Link>
    //       <p className="text-sm text-gray-500 mt-3">
    //         Configure audit thresholds, data sources, and publishing rules.
    //       </p>
    //     </div>
    //   </section>
    // </div>

    <div className="space-y-8 px-8 py-6 bg-[#111] min-h-screen text-gray-200">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">
            Government Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Monitor, audit, and manage policies across projects.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-emerald-900/40 text-emerald-400 border border-emerald-600/30 text-sm font-medium">
            Verified Registry
          </div>
          <div className="px-3 py-1 rounded-full bg-blue-900/40 text-blue-400 border border-blue-600/30 text-sm font-medium">
            Live Monitoring
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Pending Audits"
          value="12"
          delta="+3 this week"
          color="bg-amber-500"
        />
        <StatCard
          title="Approved Projects"
          value="87"
          delta="+6 this month"
          color="bg-emerald-600"
        />
        <StatCard
          title="Anchored on Chain"
          value="64"
          delta="+4 this month"
          color="bg-blue-600"
        />
        <StatCard
          title="Policies Active"
          value="9"
          delta="2 under review"
          color="bg-purple-600"
        />
      </section>

      {/* Quick Links */}
      {/* <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <QuickCard
      icon={<BarChart3 className="w-5 h-5 text-cyan-400" />}
      title="Reports & Analytics"
      desc="View CO₂ reductions, project distribution, and trend insights."
      to="/government/reports"
      action="Open Reports"
    />
    <QuickCard
      icon={<FileSearch className="w-5 h-5 text-yellow-400" />}
      title="Audit Projects"
      desc="Run MRV checks, approve or request changes on submissions."
      to="/government/audit-projects"
      action="Go to Audits"
    />
    <QuickCard
      icon={<BookMarked className="w-5 h-5 text-purple-400" />}
      title="Policies"
      desc="Create, publish, and update compliance frameworks."
      to="/government/policies"
      action="Manage Policies"
    />
  </section> */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QuickCard
          icon={<BarChart3 className="w-5 h-5 text-cyan-400" />}
          title="Reports & Analytics"
          desc="View CO₂ reductions, project distribution, and trend insights."
          to="/government/reports"
          action="Open Reports"
        />
        <QuickCard
          icon={<FileSearch className="w-5 h-5 text-yellow-400" />}
          title="Audit Projects"
          desc="Run MRV checks, approve or request changes on submissions."
          to="/government/audit-projects"
          action="Go to Audits"
        />
        <QuickCard
          icon={<BookMarked className="w-5 h-5 text-purple-400" />}
          title="Policies"
          desc="Create, publish, and update compliance frameworks."
          to="/government/policies"
          action="Manage Policies"
        />
      </section>

      {/* Compliance / Actions / Settings */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance */}
        <div className="rounded-2xl p-6 border border-gray-700 bg-[#1a1a1a] hover:shadow-[0_0_12px_#2DD4BF] hover:border-emerald-400 transition">
          <h3 className="font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Compliance
            Snapshot
          </h3>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-center justify-between">
              <span>MRV-complete this month</span>
              <span className="font-semibold text-gray-100">18</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Pending verifications</span>
              <span className="font-semibold text-gray-100">12</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Non-compliance flags</span>
              <span className="font-semibold text-rose-400">3</span>
            </li>
          </ul>
        </div>

        {/* Recent Actions */}
        <div className="rounded-2xl p-6 border border-gray-700 bg-[#1a1a1a] hover:shadow-[0_0_12px_#FACC15] hover:border-yellow-400 transition">
          <h3 className="font-semibold text-gray-100 mb-4">Recent Actions</h3>
          <ul className="space-y-3 text-sm text-gray-300">
            <li>Approved: Seagrass Meadow #204</li>
            <li>Anchored: Mangrove Expansion #127</li>
            <li>Policy Updated: MRV v2.1 rollout</li>
          </ul>
        </div>

        {/* Settings */}
        <div className="rounded-2xl p-6 border border-gray-700 bg-[#1a1a1a] hover:shadow-[0_0_12px_#2DD4BF] hover:border-emerald-400 transition">
          <h3 className="font-semibold text-gray-100 mb-4">Quick Settings</h3>
          <Link
            to="/government/settings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg 
        border border-gray-600 text-gray-300 hover:border-emerald-400 hover:text-emerald-400 transition
            hover:shadow-[0_0_9px_#2DD4BF]"
          >
            <Settings className="w-4 h-4" /> Open Settings
          </Link>
          <p className="text-sm text-gray-400 mt-3">
            Configure audit thresholds, data sources, and publishing rules.
          </p>
        </div>
      </section>
    </div>
  );
}

// function StatCard({ title, value, delta, color }) {
//   return (
//     // <div className="bg-white rounded-2xl shadow p-6">
//     //   <div className="text-sm text-gray-500">{title}</div>
//     //   <div className="mt-2 text-3xl font-bold text-gray-900">{value}</div>
//     //   <div className="mt-2 inline-block px-2 py-1 text-xs text-white rounded" style={{ backgroundColor: undefined }}>
//     //     <span className={`px-2 py-1 rounded text-white ${color}`}>{delta}</span>
//     //   </div>
//     // </div>
//     <div className="bg-[#1a1a1a] rounded-2xl shadow-md p-6 border border-gray-800 hover:border-teal-400 hover:shadow-[0_0_15px_#14b8a6] transition">
//   <div className="text-sm text-gray-400">{title}</div>
//   <div className="mt-2 text-3xl font-bold text-gray-100">{value}</div>
//   <div className="mt-3 inline-block">
//     <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${color}`}>
//       {delta}
//     </span>
//   </div>
// </div>

//   );
// }

// function QuickCard({ icon, title, desc, to, action }) {
//   return (
// <div className="bg-white rounded-2xl shadow p-6 flex flex-col">
//   <div className="flex items-center gap-3">
//     <div className="p-2 rounded-lg bg-green-50 text-green-700">{icon}</div>
//     <h3 className="font-semibold text-gray-900">{title}</h3>
//   </div>
//   <p className="text-sm text-gray-600 mt-3 flex-1">{desc}</p>
//   <div className="mt-4">
//     <Link
//       to={to}
//       className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:brightness-110"
//     >
//       {action}
//     </Link>
//   </div>
// </div>
//     <div className="bg-[#1a1a1a] rounded-2xl shadow-md p-6 flex flex-col
//      border border-gray-800 transition
//      hover:border-emerald-400 hover:shadow-[0_0_15px_#10b981]">
//   <div className="flex items-center gap-3">
//     <div className="p-2 rounded-lg bg-emerald-900/40 text-emerald-400">
//       {icon}
//     </div>
//     <h3 className="font-semibold text-gray-100">{title}</h3>
//   </div>
//   <p className="text-sm text-gray-400 mt-3 flex-1">{desc}</p>
//   <div className="mt-4">
//     <Link
//       to={to}
//       className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
//                  bg-emerald-600 text-white
//                  hover:bg-emerald-500 hover:shadow-[0_0_12px_#10b981]"
//     >
//       {action}
//     </Link>
//   </div>
// </div>

function StatCard({ title, value, delta, color }) {
  // map Tailwind color classes → hex values for glow
  const glowMap = {
    "bg-amber-500": "#f59e0b",
    "bg-emerald-600": "#059669",
    "bg-blue-600": "#2563eb",
    "bg-purple-600": "#9333ea",
  };

  const glowColor = glowMap[color] || "#14b8a6"; // fallback teal

  return (
    <div
      className="bg-[#1a1a1a] rounded-2xl shadow-md p-6 border border-transparent transition-all duration-300"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = glowColor;
        e.currentTarget.style.boxShadow = `0 0 15px ${glowColor}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "transparent";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div className="text-sm text-gray-400">{title}</div>
      <div className="mt-2 text-3xl font-bold text-gray-100">{value}</div>
      <div className="mt-3 inline-block">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium text-white border border-gray-700 transition-all duration-300`}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = glowColor;
            e.currentTarget.style.boxShadow = `0 0 8px ${glowColor}`;
            e.currentTarget.style.color = glowColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = glowColor;
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.color = "white";
          }}
        >
          {delta}
        </span>
      </div>
    </div>
  );
}

const QuickCard = ({ icon, title, desc, to, action }) => {
  // extract Tailwind color class from icon
  const iconColor = icon.props.className?.match(/text-(\w+)-(\d{3})/);
  const glowColor = iconColor
    ? {
        cyan: "#22d3ee",
        yellow: "#facc15",
        purple: "#a855f7",
        emerald: "#10b981",
      }[iconColor[1]] || "#10b981"
    : "#10b981";

  return (
    <div
      className="bg-[#1a1a1a] rounded-2xl shadow-md p-6 flex flex-col border border-transparent transition-all duration-300"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = glowColor;
        e.currentTarget.style.boxShadow = `0 0 15px ${glowColor}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "transparent";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#111]">{icon}</div>
        <h3 className="font-semibold text-gray-100">{title}</h3>
      </div>
      <p className="text-sm text-gray-400 mt-3 flex-1">{desc}</p>
      <div className="mt-4">
        <Link
          to={to}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white border border-gray-700 transition-all duration-300"
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = glowColor;
            e.currentTarget.style.boxShadow = `0 0 12px ${glowColor}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = glowColor;
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {action}
        </Link>
      </div>
    </div>
  );
};
