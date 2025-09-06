import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { getProjects } from "../store/projects";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiTrendingUp,
  FiCheckCircle,
  FiActivity,
} from "react-icons/fi";

const getRiskColor = (riskLevel) => {
  const riskColorMap = {
    Low: "bg-[#16A34A]",
    Medium: "bg-amber-500",
    High: "bg-red-500",
  };
  return riskColorMap[riskLevel] || "bg-gray-500";
};

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [username, setUsername] = useState("User"); // Dynamic logic
  const [profilePic, setProfilePic] = useState(
    "https://via.placeholder.com/40" // Dynamic profile
  );

  useEffect(() => {
    setProjects(getProjects());
    try {
      const userData = JSON.parse(localStorage.getItem("user")) || {};
      if (userData.name) setUsername(userData.name);
      if (userData.profilePic) setProfilePic(userData.profilePic);
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
    }
  }, []);

  const totals = useMemo(() => {
    const totalCO2 = projects.reduce(
      (sum, p) => sum + (p.predictedCO2 || 0),
      0
    );
    const pending = projects.filter((p) => p.status === "Pending").length;
    const approved = projects.filter((p) => p.status === "Approved").length;
    const anchored = projects.filter((p) =>
      p.status?.includes("Blockchain")
    ).length;
    const monitoring = projects.filter((p) => p.status === "Monitoring").length;
    return {
      total: projects.length,
      totalCO2,
      pending,
      approved,
      anchored,
      monitoring,
    };
  }, [projects]);

  return (
      // <div className="p-8">
      //   {/* Welcome Header */}
      //   <div className="flex items-center justify-between mb-8">
      //     <h1 className="text-3xl font-bold text-gray-900">
      //       Welcome back, {username}!
      //     </h1>
      //     <img
      //       src={profilePic}
      //       alt="Profile"
      //       className="w-10 h-10 rounded-full object-cover"
      //     />
      //   </div>

      //   {/* Metrics Section */}
      //   <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
      //     <MetricCard
      //       title="Total Projects"
      //       value={totals.total || 12}
      //       trend="+2 this month"
      //       icon={<FiUsers className="h-6 w-6 text-white" />}
      //       bgColor="bg-blue-500"
      //     />
      //     <MetricCard
      //       title="CO₂ Credits Earned"
      //       value={totals.totalCO2 || 1247}
      //       trend="+156 this month"
      //       icon={<FiTrendingUp className="h-6 w-6 text-white" />}
      //       bgColor="bg-green-500"
      //     />
      //     <MetricCard
      //       title="Projects Approved"
      //       value={totals.approved || 8}
      //       trend="+3 this month"
      //       icon={<FiCheckCircle className="h-6 w-6 text-white" />}
      //       bgColor="bg-amber-500"
      //     />
      //     <MetricCard
      //       title="Active Monitoring"
      //       value={totals.monitoring || 4}
      //       trend="Real-time data"
      //       icon={<FiActivity className="h-6 w-6 text-white" />}
      //       bgColor="bg-purple-500"
      //     />
      //   </div>

      //   {/* Recent Projects Table */}
      //   <div>
      //     <h2 className="text-2xl font-bold text-gray-900 mb-4">
      //       Recent Projects
      //     </h2>
      //     <div className="bg-white shadow-md rounded-2xl overflow-hidden">
      //       <table className="w-full text-left">
      //         <thead className="bg-gray-100 text-gray-600 text-sm">
      //           <tr>
      //             <th className="py-3 px-4">Project</th>
      //             <th className="py-3 px-4">Type</th>
      //             <th className="py-3 px-4">Size (ha)</th>
      //             <th className="py-3 px-4">Pred. CO₂ (t/yr)</th>
      //             <th className="py-3 px-4">Risk</th>
      //             <th className="py-3 px-4">Status</th>
      //           </tr>
      //         </thead>
      //         <tbody>
      //           {projects.length > 0 ? (
      //             projects.map((p) => (
      //               <tr key={p.id} className="border-t">
      //                 <td className="py-3 px-4">
      //                   <Link
      //                     to={`/project/${p.id}`}
      //                     className="text-[#1D4ED8] hover:underline"
      //                   >
      //                     {p.name}
      //                   </Link>
      //                 </td>
      //                 <td className="py-3 px-4">{p.type}</td>
      //                 <td className="py-3 px-4">{p.sizeHa}</td>
      //                 <td className="py-3 px-4">{p.predictedCO2}</td>
      //                 <td className="py-3 px-4">
      //                   <span
      //                     className={`px-2 py-1 rounded-full text-white text-xs ${getRiskColor(
      //                       p.riskLevel
      //                     )}`}
      //                   >
      //                     {p.riskLevel}
      //                   </span>
      //                 </td>
      //                 <td className="py-3 px-4">
      //                   <span className="px-2 py-1 rounded-full bg-blue-100 text-[#1D4ED8] text-xs">
      //                     {p.status}
      //                   </span>
      //                 </td>
      //               </tr>
      //             ))
      //           ) : (
      //             <tr>
      //               <td colSpan={6} className="py-10 text-center text-gray-500">
      //                 No projects yet — add one from <b>Add Project</b>.
      //               </td>
      //             </tr>
      //           )}
      //         </tbody>
      //       </table>
      //     </div>
      //   </div>
      // </div>
      
      <div className="p-8 md:ml-64 space-y-8 bg-[#121110] min-h-screen text-gray-200">
  {/* Welcome Header */}
  <div className="flex items-center justify-between mb-8">
    <h1 className="text-3xl font-bold text-teal-400">
      Welcome back, {username}!
    </h1>
    <img
      src={profilePic}
      alt="Profile"
      className="w-10 h-10 rounded-full object-cover border-2 border-teal-400"
    />
  </div>

  {/* Metrics Section */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
    <MetricCard
      title="Total Projects"
      value={totals.total || 12}
      trend="+2 this month"
      icon={<FiUsers className="h-6 w-6 text-teal-400" />}
      bgColor="bg-[#1a1a1a]"
      hoverGlow="hover:shadow-[0_0_10px_#2DD4BF]"
    />
    <MetricCard
      title="CO₂ Credits Earned"
      value={totals.totalCO2 || 1247}
      trend="+156 this month"
      icon={<FiTrendingUp className="h-6 w-6 text-cyan-400" />}
      bgColor="bg-[#1a1a1a]"
      hoverGlow="hover:shadow-[0_0_10px_#22D3EE]"
    />
    <MetricCard
      title="Projects Approved"
      value={totals.approved || 8}
      trend="+3 this month"
      icon={<FiCheckCircle className="h-6 w-6 text-green-400" />}
      bgColor="bg-[#1a1a1a]"
      hoverGlow="hover:shadow-[0_0_10px_#10B981]"
    />
    <MetricCard
      title="Active Monitoring"
      value={totals.monitoring || 4}
      trend="Real-time data"
      icon={<FiActivity className="h-6 w-6 text-violet-400" />}
      bgColor="bg-[#1a1a1a]"
      hoverGlow="hover:shadow-[0_0_10px_#8B5CF6]"
    />
  </div>

  {/* Recent Projects Table */}
  <div>
    <h2 className="text-2xl font-bold text-teal-400 mb-4">
      Recent Projects
    </h2>
    <div className="bg-[#1a1a1a] shadow-lg rounded-2xl overflow-hidden border border-gray-700">
      <table className="w-full text-left">
        <thead className="bg-[#111] text-gray-400 text-sm">
          <tr>
            <th className="py-3 px-4">Project</th>
            <th className="py-3 px-4">Type</th>
            <th className="py-3 px-4">Size (ha)</th>
            <th className="py-3 px-4">Pred. CO₂ (t/yr)</th>
            <th className="py-3 px-4">Risk</th>
            <th className="py-3 px-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {projects.length > 0 ? (
            projects.map((p) => (
              <tr
                key={p.id}
                className="border-t border-gray-700 hover:bg-[#222] transition-colors duration-200"
              >
                <td className="py-3 px-4">
                  <Link
                    to={`/project/${p.id}`}
                    className="text-teal-400 hover:underline"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="py-3 px-4">{p.type}</td>
                <td className="py-3 px-4">{p.sizeHa}</td>
                <td className="py-3 px-4">{p.predictedCO2}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getRiskColor(
                      p.riskLevel
                    )}`}
                  >
                    {p.riskLevel}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded-full bg-teal-900 text-teal-400 text-xs">
                    {p.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="py-10 text-center text-gray-500">
                No projects yet — add one from <b>Add Project</b>.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>

  );
}

// Metric Card Component
function MetricCard({ title, value, trend, icon, bgColor }) {
  return (
    <div className="bg-white shadow-md rounded-2xl p-6 flex items-center space-x-4">
      <div className={`p-4 rounded-full ${bgColor}`}>{icon}</div>
      <div>
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500">{trend}</div>
      </div>
    </div>
  );
}
