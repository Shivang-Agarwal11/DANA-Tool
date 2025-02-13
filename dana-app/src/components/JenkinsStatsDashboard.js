import React, { useEffect, useState } from "react";
import { apiService } from "../services/apiServices";
import {
  Container,
  Typography,
  Select,
  MenuItem,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const COLORS = ["#0088FE", "#FFA07A", "#00C49F", "#FFD700"];

const JenkinsDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [selectedBuild, setSelectedBuild] = useState(null);
  const [data, setData] = useState({
    lastBuild: {},
    buildHistory: [],
    queueInfo: [],
    logs: "",
  });

  useEffect(() => {
    fetchJenkinsJobs();
  }, []);

  useEffect(() => {
    if (selectedJob) {
      fetchJenkinsData(selectedJob);
      const interval = setInterval(() => fetchJenkinsData(selectedJob), 10000);
      return () => clearInterval(interval);
    }
  }, [selectedJob]);

  useEffect(() => {
    if (selectedBuild) {
      fetchLogs(selectedJob, selectedBuild);
    }
  }, [selectedBuild]);

  const fetchJenkinsJobs = async () => {
    try {
      const response = await apiService.getJenkinsJobs();
      setJobs(response.data.jobs);
      if (response.data.jobs.length > 0) setSelectedJob(response.data.jobs[0].name);
    } catch (error) {
      console.error("Error fetching Jenkins jobs:", error);
    }
  };

  const fetchJenkinsData = async (jobName) => {
    try {
      const lastBuildRes = await apiService.getJenkinsLastBuild({ jobName });
      const buildHistoryRes = await apiService.getJenkinsBuildHistory({ jobName });
      const queueRes = await apiService.getJenkinsQueueInfo();
      setData({
        lastBuild: lastBuildRes.data,
        buildHistory: buildHistoryRes.data.builds,
        queueInfo: queueRes.data.items,
        logs: "",
      });
    } catch (error) {
      console.error("Error fetching Jenkins data:", error);
    }
  };

  const fetchLogs = async (jobName, buildNumber) => {
    try {
      const logsRes = await apiService.getJenkinsLogs({ jobName, buildNumber });
      setData((prevData) => ({ ...prevData, logs: logsRes.data }));
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  const buildStatusData = [
    { name: "Success", count: data.buildHistory.filter(b => b.result === "SUCCESS").length },
    { name: "Failure", count: data.buildHistory.filter(b => b.result === "FAILURE").length },
  ];

  return (
    <Container sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Jenkins Pipeline Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Select Job</InputLabel>
            <Select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
              {jobs.map((job) => (
                <MenuItem key={job.name} value={job.name}>
                  {job.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid container spacing={3} sx={{ mb: 2, mt: 2 , ml:0}}>
          <Grid item xs={12}>
            <Card sx={{ backgroundColor: "#f5f5f5", p: 3, boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#333" }}>
                  Latest Pipeline Execution
                </Typography>
                {data.lastBuild && data.lastBuild.result ? (
                  <>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={4}>
                        <Typography variant="body1" sx={{ fontWeight: "bold", color: "#555" }}>
                          Status:
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography
                          variant="body1"
                          sx={{
                            display: "inline-block",
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            fontWeight: "bold",
                            backgroundColor:
                              data.lastBuild.result === "SUCCESS" ? "#c8e6c9" : "#ffcdd2",
                            color: data.lastBuild.result === "SUCCESS" ? "#2e7d32" : "#c62828",
                          }}
                        >
                          {data.lastBuild.result}
                        </Typography>
                      </Grid>

                      <Grid item xs={4}>
                        <Typography variant="body1" sx={{ fontWeight: "bold", color: "#555" }}>
                          Duration:
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1" sx={{ color: "#333" }}>
                          {data.lastBuild.duration / 1000} seconds
                        </Typography>
                      </Grid>

                      <Grid item xs={4}>
                        <Typography variant="body1" sx={{ fontWeight: "bold", color: "#555" }}>
                          Timestamp:
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1" sx={{ color: "#333" }}>
                          {new Date(data.lastBuild.timestamp).toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </>
                ) : (
                  <Typography variant="body2" sx={{ color: "#777" }}>
                    No recent builds found.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>


        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Select Build</InputLabel>
            <Select value={selectedBuild} onChange={(e) => setSelectedBuild(e.target.value)}>
              {data.buildHistory.map((build) => (
                <MenuItem key={build.number} value={build.number}>
                  {build.number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: "#ffffff" }}>
            <CardContent>
              <Typography variant="h6">Build Status</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={buildStatusData} barSize={40}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#4682B4" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: "#ffffff" }}>
            <CardContent>
              <Typography variant="h6">Build Trends</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.buildHistory.slice(0, 10).reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="number" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="duration" stroke="#4682B4" name="Build Duration" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card sx={{ backgroundColor: "#ffffff" }}>
            <CardContent>
              <Typography variant="h6">Build Logs</Typography>
              <Paper sx={{ p: 2, maxHeight: 300, overflow: "auto", backgroundColor: "#F8F9FA" }}>
                <Typography variant="body2" component="pre" sx={{ whiteSpace: "pre-wrap" }}>
                  {data.logs || "Select a build to view logs."}
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default JenkinsDashboard;
