import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LabelList
} from "recharts";
import {
  Typography, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { apiService } from "../services/apiServices";

const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28"];

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

  if (!stats) return <Typography align="center" color="textSecondary">Loading GitHub Stats...</Typography>;

  const prData = [
    { name: "Open PRs", count: stats.pullRequests.open },
    { name: "Closed PRs", count: stats.pullRequests.closed },
  ];

  const issueData = [
    { name: "Open Issues", count: stats.issues.open },
    { name: "Closed Issues", count: stats.issues.closed },
  ];

  const branchData = [
    { name: "Active Branches", count: stats.branches.active },
    { name: "Inactive Branches", count: stats.branches.inactive },
  ];

  return (
    <div className="p-6 space-y-6" style={{ marginTop: "20px", backgroundColor: "#e3e7e7", paddingLeft: "20px", paddingRight: "20px", paddingBottom: "20px" }}>
      {/* Charts Section */}
      <Grid container spacing={3} justifyContent="center">
        {/* Pull Requests Bar Chart */}
        <Grid item xs={12} md={3}>
          <Card elevation={5} sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom color="textSecondary" fontWeight="bold">
                Pull Requests
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prData} barSize={40}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8">
                    <LabelList dataKey="count" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Issues Bar Chart */}
        <Grid item xs={12} md={3}>
          <Card elevation={5} sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom color="textSecondary" fontWeight="bold">
                Issues
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={issueData} barSize={40}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#FF8042">
                    <LabelList dataKey="count" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Branch Activity Donut Chart */}
        <Grid item xs={12} md={5}>
          <Card elevation={5} sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom color="textSecondary" fontWeight="bold">
                Branch Activity
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={branchData} 
                    dataKey="count" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={90} 
                    innerRadius={50} // Makes it a donut chart
                    fill="#8884d8" 
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {branchData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Branch Details Table */}
      <Card elevation={5} sx={{ p: 2, mt: 3 }}>
        <CardContent>
          <Typography variant="h6" align="center" gutterBottom color="textSecondary" fontWeight="bold">
            Branch Details
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 2, borderRadius: "10px", overflow: "hidden" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#3f51b5" }}>
                  <TableCell align="left" sx={{ fontWeight: "bold", color: "white" }}>Branch Name</TableCell>
                  <TableCell align="left" sx={{ fontWeight: "bold", color: "white" }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.branches.activity.map((branch, index) => (
                  <TableRow 
                    key={index} 
                    sx={{ 
                      "&:hover": { backgroundColor: "#f1f1f1" }, 
                      transition: "background 0.3s ease-in-out" 
                    }}
                  >
                    <TableCell sx={{ fontWeight: "bold" }}>{branch.name}</TableCell>
                    <TableCell>
                      <Chip 
                        icon={branch.active ? <CheckCircle sx={{ color: "green" }} /> : <Cancel sx={{ color: "red" }} />}
                        label={branch.active ? "Active" : "Inactive"}
                        sx={{
                          bgcolor: branch.active ? "#e8f5e9" : "#ffebee",
                          color: branch.active ? "green" : "red",
                          fontWeight: "bold",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default GitHubStatsDashboard;
