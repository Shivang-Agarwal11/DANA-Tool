import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { apiService } from "../services/apiServices";

const COLORS = ["#0088FE", "#FF8042"];

const GitHubStatsDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiService.getGithubStats();
        setStats(response.data);
        console.log(response);
      } catch (error) {
        console.error("Error fetching GitHub stats:", error);
      }
    };

    fetchStats();
  }, []);

  if (!stats) return <p className="text-center text-gray-500">Loading GitHub Stats...</p>;

  const prIssueData = [
    { name: "Open PRs", count: stats.pullRequests.open },
    { name: "Closed PRs", count: stats.pullRequests.closed },
    { name: "Open Issues", count: stats.issues.open },
    { name: "Closed Issues", count: stats.issues.closed },
  ];

  const branchData = [
    { name: "Active Branches", count: stats.branches.active },
    { name: "Inactive Branches", count: stats.branches.inactive },
  ];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">📊 GitHub Repository Stats</h2>

      {/* Grid Layout for the Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* PRs & Issues Bar Chart */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-center mb-4">Pull Requests & Issues</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prIssueData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Branches Pie Chart */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-center mb-4">Branch Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={branchData} dataKey="count" cx="50%" cy="50%" outerRadius={80} label>
                {branchData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Branch Activity Table */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h3 className="text-lg font-semibold text-center mb-4">Branch Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Branch Name</th>
                <th className="border px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.branches.activity.map((branch, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{branch.name}</td>
                  <td className={`border px-4 py-2 ${branch.active ? "text-green-500" : "text-red-500"}`}>
                    {branch.active ? "Active" : "Inactive"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default GitHubStatsDashboard;
