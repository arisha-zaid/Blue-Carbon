import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getProjects } from "../store/projects";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

export default function AdminAnalytics() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  // Projects by type
  const byType = Object.values(projects.reduce((acc, p) => {
    acc[p.type] = acc[p.type] || { type: p.type, count: 0 };
    acc[p.type].count += 1;
    return acc;
  }, {}));

  // CO2 by region
  const co2ByRegion = Object.values(projects.reduce((acc, p) => {
    acc[p.location] = acc[p.location] || { location: p.location, co2: 0 };
    acc[p.location].co2 += p.predictedCO2 || 0;
    return acc;
  }, {}));

  // Status distribution
  const statusDist = Object.values(projects.reduce((acc, p) => {
    acc[p.status] = acc[p.status] || { status: p.status, value: 0 };
    acc[p.status].value += 1;
    return acc;
  }, {}));

  const COLORS = ["#1D4ED8", "#16A34A", "#F59E0B", "#EF4444", "#8B5CF6"];

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50 min-h-screen">
        <h2 className="text-2xl font-bold mb-6">Admin Analytics</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="text-lg font-semibold mb-4">Projects by Type</h3>
            <BarChart width={400} height={250} data={byType}>
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#1D4ED8" />
            </BarChart>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="text-lg font-semibold mb-4">CO₂ by Region</h3>
            <BarChart width={400} height={250} data={co2ByRegion}>
              <XAxis dataKey="location" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="co2" fill="#16A34A" />
            </BarChart>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow col-span-2">
            <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
            <PieChart width={400} height={300}>
              <Pie
                data={statusDist}
                dataKey="value"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {statusDist.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </div>
        </div>
      </main>
    </div>
  );
}
