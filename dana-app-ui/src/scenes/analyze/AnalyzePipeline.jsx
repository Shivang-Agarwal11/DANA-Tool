import { Alert, Box, Button, IconButton, Typography, useTheme, Select, MenuItem, Input, CircularProgress } from "@mui/material";
import { tokens } from "../../theme";
import { Commit, Person, RemoveRedEye, CopyAllOutlined, ForkLeftRounded, CrisisAlertRounded, GitHub, RequestQuote, BroadcastOnHomeOutlined, BroadcastOnPersonalRounded, Alarm, AddAlertOutlined, CrisisAlert, BusAlert, TaxiAlert, AddAlertRounded, AnalyticsOutlined } from "@mui/icons-material";
import Header from "../../components/Header";
import { apiService } from "../../services/apiServices";
import { useEffect, useState } from "react";
import InputBox from "../../components/InputBox";
import { useNavigate } from "react-router-dom";

const AnalyzePipeline = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [updates, setUpdates] = useState([]);
  const [selectedBuild, setSelectedBuild] = useState(null);
  const handleChange = (event) => {
    setSelectedJob(event.target.value);
  };
  const [data, setData] = useState({
    lastBuild: {},
    buildHistory: [],
    queueInfo: [],
    logs: "",
  });

  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJenkinsJobs();
  }, []);
  useEffect(() => {
    // Establish SSE connection
    const eventSource = new EventSource("http://localhost:8088/events");

    eventSource.onmessage = (event) => {
      console.log(event.data)
      if (event.data.message == undefined) {
        const data = JSON.parse(event.data);
        setUpdates((prevUpdates) => [...prevUpdates, data]);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    if (selectedJob) {
      fetchJenkinsData(selectedJob);
      // const interval = setInterval(() => fetchJenkinsData(selectedJob), 10000);
      // return () => clearInterval(interval);
    }
  }, [selectedJob]);

  useEffect(() => {
    if (selectedBuild) {
      fetchLogs(selectedJob, selectedBuild);
    }
  }, [selectedBuild]);


  if (!jobs) {
    return <div>Loading...</div>;
  }

  const fetchJenkinsJobs = async () => {
    try {
      const response = await apiService.getJenkinsJobs();
      setJobs(response.data.jobs);
      if (response.data.jobs.length > 0) setSelectedJob(response.data.jobs[0].name);
    } catch (error) {
      if (error.status === 401) {
        console.log("Unauthorized");
        localStorage.removeItem("authToken");
        navigate("/form");
      }
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
      if (error.status === 401) {
        console.log("Unauthorized");
        navigate("/form");
      }
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

  const buildStatusData =
  {
    "Success": data.buildHistory.filter(b => b.result === "SUCCESS").length,
    "Failures": data.buildHistory.filter(b => b.result === "FAILURE").length
  };

  const handleSend = async (message) => {
    try {
      const response = await apiService.chatWithAnalysis({ message });
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleAnalyzePipeline = async () => {
    try {
      setUpdates([]);
      setChatMessages([]); // Clear chat
      setLoading(true); // Start loading
      const response = await apiService.analyzePipeline({
        jobName: selectedJob,
        buildNumber: selectedBuild,
      });
      setChatMessages([{ sender: "System", text: sanitizeResponse(response.data) }]);
    } catch (error) {
      console.error("Error analyzing pipeline:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };
  const formatBuildStats = (data) => {

    const formattedData = [{
      "id": selectedJob,
      color: tokens("dark").greenAccent[500],
      "data": data.map((build) => ({
        "x": build.number,
        "y": build.duration,
      })),
    }];
    console.log(formattedData);
    return formattedData;
  };

  const sanitizeResponse = (text) => {
    return text.replace(/<think>.*?<\/think>/gs, "").trim();
  };
  const jobsPresent = jobs.length;


  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Jenkins Dashboard" subtitle="Welcome to your Jenkins Stats Dashboard" />
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        <Box display="flex" flexDirection="column" p="15px" gridColumn="span 5">
          <Typography color={colors.greenAccent[500]} variant="h6" fontWeight="600" mb={1}>
            Select a Job
          </Typography>
          <Select
            value={selectedJob}
            onChange={handleChange}
            displayEmpty
            sx={{ backgroundColor: colors.primary[400], color: colors.grey[100], minWidth: "200px" }}
          >
            <MenuItem value="" disabled>
              Choose a job
            </MenuItem>
            {jobs.map((job, i) => (
              <MenuItem key={i} value={job.name}>
                {job.name}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box display="flex" flexDirection="column" p="15px" gridColumn="span 5">
          <Typography color={colors.greenAccent[500]} variant="h6" fontWeight="600" mb={1}>
            Select Build Number
          </Typography>
          <Select
            value={selectedBuild}
            onChange={(e) => setSelectedBuild(e.target.value)}
            displayEmpty
            sx={{ backgroundColor: colors.primary[400], color: colors.grey[100], minWidth: "200px" }}
          >
            <MenuItem value="" disabled>
              Choose a Build
            </MenuItem>
            {data.buildHistory.map((build) => (
              <MenuItem key={build.number} value={build.number}>
                {build.number}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box display="flex" flexDirection="column" p="15px" gridColumn="span 2" mt={4}>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
            onClick={handleAnalyzePipeline}
            disabled={loading} // Disable button when loading
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: colors.grey[100] }} />
            ) : (
              <>
                <AnalyticsOutlined sx={{ mr: "10px" }} />
                Analyze Pipeline Logs
              </>
            )}
          </Button>
        </Box>
        
          <Box flexDirection="column" p="15px" gridColumn="span 12" marginTop={0} display="flex" gridRow={updates.length==2? "span 2" : updates.length>=3?"span 3":"span 1"}>
          {updates.length > 0 && updates.map((msg, index) => (
              <Typography 
              color="#FFFFFF" // White text for high contrast
              variant="h5" 
              fontWeight="900" 
              backgroundColor="#4A4A4A" // Darker gray for better visibility
              p={2} 
              key={index} 
              textAlign="center" 
              borderRadius={5} 
              border="2px solid rgb(0, 76, 255)" // Gold border for a subtle highlight
              sx={{ 
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)", // Adds text shadow for better readability
              }}
            >
              AI Agent performing task: {msg.task} {msg.status}
            </Typography>
            
            ))}
          </Box>
        <Box display="flex" flexDirection="column" p="15px" gridColumn="span 12" gridRow="span 4" backgroundColor={colors.grey[900]}>
          <InputBox onSend={handleSend} response={chatMessages} sanitizeResponse={sanitizeResponse} />

        </Box>
      </Box>
    </Box>
  );
};

export default AnalyzePipeline;
