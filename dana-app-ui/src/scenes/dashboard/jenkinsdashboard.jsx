import { Alert, Box, Button, IconButton, Typography, useTheme, Select, MenuItem } from "@mui/material";
import { tokens } from "../../theme";
import { mockTransactions } from "../../data/mockData";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EmailIcon from "@mui/icons-material/Email";
import { Commit, Person, RemoveRedEye, CopyAllOutlined, ForkLeftRounded, CrisisAlertRounded, GitHub, RequestQuote, BroadcastOnHomeOutlined, BroadcastOnPersonalRounded, Alarm, AddAlertOutlined, CrisisAlert, BusAlert, TaxiAlert, AddAlertRounded } from "@mui/icons-material";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TrafficIcon from "@mui/icons-material/Traffic";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import LineChart2 from "../../components/LineChart2";
import GeographyChart from "../../components/GeographyChart";
import BarChart from "../../components/BarChart";
import StatBox from "../../components/StatBox";
import ProgressCircle from "../../components/ProgressCircle";
import { apiService } from "../../services/apiServices";
import { useEffect, useState } from "react";
import { b } from "framer-motion/m";

const JenkinsDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
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

  useEffect(() => {
    fetchJenkinsJobs();
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

  const buildStatusData =
  {
    "Success": data.buildHistory.filter(b => b.result === "SUCCESS").length,
    "Failures": data.buildHistory.filter(b => b.result === "FAILURE").length
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
  console.log(formatBuildStats(data.buildHistory));
  const jobsPresent = jobs.length;
  // const contributors = stats.totalContributors;
  // const views = stats.traffic.views.count;
  // const countClones = stats.traffic.clones.count;
  // const forks = stats.totalForks;
  // const openPR = stats.openPRs;
  // const closedPR = stats.closedPRs;
  // const openIssues = stats.openIssues;
  // const closedIssues = stats.closedIssues;
  // const branches = stats.branches.total;
  // const activeBranches = stats.branches.active;
  // const inactiveBranches = stats.branches.inactive;

  // const clonesTableData = stats.traffic.clones.clones;
  // const viewsTableData = stats.traffic.views.views;
  // const branchesTableData = stats.branches.activity;  
  // const referrersTableData = stats.referrers;

  // const weeklyCommitActivity = formatWeeklyData(stats.weeklyCommitActivity);
  // const codeFrequency = formatCodeFrequencyData(stats.codeFrequency);


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
        {/* ROW 1 */}
        <Box
          gridColumn="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={jobsPresent}
            subtitle="Jobs Present"
            // progress="0"
            // increase="+14%"
            icon={
              <Commit
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 6"
          gridRow="span 1"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Jenkins Jobs Available
            </Typography>
          </Box>
          {jobs.map((job, i) => (
            <Box
              key={`${i}`}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`4px solid ${colors.primary[500]}`}
              p="15px"
            >
              <Box>
                {/* <Typography
                  color={colors.greenAccent[500]}
                  variant="h5"
                  fontWeight="600"
                >
                  {job.name}
                </Typography> */}
                <Typography color={colors.greenAccent[500]}
                  variant="h5"
                  fontWeight="600">
                  Job Name
                </Typography>
              </Box>
              <Box color={colors.grey[100]}>{job.name}</Box>
            </Box>
          ))}
        </Box>
        <Box display="flex" flexDirection="column" p="15px">
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
        <Box display="flex" flexDirection="column" p="15px">
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
        {/* <Box
          gridColumn="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={contributors}
            subtitle="Contributors"
            // progress="0.50"
            // increase="+21%"
            icon={
              <Person
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={views}
            subtitle="Views"
            // progress="0.30"
            // increase="+5%"
            icon={
              <RemoveRedEye
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={countClones}
            subtitle="Clones"
            // progress="0.80"
            // increase="+43%"
            icon={
              <CopyAllOutlined
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={forks}
            subtitle="Total Forks"
            // progress="0.80"
            // increase="+43%"
            icon={
              <ForkLeftRounded
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={closedPR}
            subtitle="Closed PRs"
            // progress="0.80"
            // increase="+43%"
            icon={
              <RequestQuote
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={openPR}
            subtitle="Open PRs"
            // progress="0.80"
            // increase="+43%"
            icon={
              <RequestQuote
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={openIssues}
            subtitle="Open Issues"
            // progress="0.80"
            // increase="+43%"
            icon={
              <AddAlertOutlined
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={closedIssues}
            subtitle="Closed Issues"
            // progress="0.80"
            // increase="+43%"
            icon={
              <AddAlertRounded
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={branches}
            subtitle="Total Branches"
            // progress="0.80"
            // increase="+43%"
            icon={
              <BroadcastOnHomeOutlined
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={activeBranches}
            subtitle="Active Branches"
            // progress="0.80"
            // increase="+43%"
            icon={
              <BroadcastOnHomeOutlined
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={inactiveBranches}
            subtitle="Inactive Branches"
            // progress="0.80"
            // increase="+43%"
            icon={
              <BroadcastOnPersonalRounded
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box> */}
        
        {/* ROW 2 */}
       <Box
          gridColumn="span 6"
          gridRow="span 3"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex "
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.grey[100]}
              >
                Pipeline Build Stats
              </Typography>
            </Box>
            <Box>
              <IconButton>
                <DownloadOutlinedIcon
                  sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
                />
              </IconButton>
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart data={formatBuildStats(data.buildHistory)} isDashboard={true} />
          </Box>
        </Box>
       
        {/* <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Traffic Views History
            </Typography>
          </Box>
          {viewsTableData.map((view, i) => (
            <Box
              key={`${i}`}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`4px solid ${colors.primary[500]}`}
              p="15px"
            >
              <Box>
                <Typography
                  color={colors.greenAccent[500]}
                  variant="h5"
                  fontWeight="600"
                >
                  {view.count}
                </Typography>
                <Typography color={colors.grey[100]}>
                  Views Count
                </Typography>
              </Box>
              <Box color={colors.grey[100]}>{stripDate(view.timestamp)}</Box>
              <Box
                // backgroundColor={colors.greenAccent[500]}
                // p="5px 10px"
                // borderRadius="4px"
              >
                <Typography
                  color={colors.greenAccent[500]}
                  variant="h5"
                  fontWeight="600"
                >
                  {view.uniques}
                </Typography>
                <Typography color={colors.grey[100]}>
                  Unique Views
                </Typography>
              </Box>
            </Box>
          // ))}
        </Box> */}

        {/* ROW 3 */}
        <Box
          gridColumn="span 6"
          gridRow="span 3"
          backgroundColor={colors.primary[400]}
          p="30px"
        >
          <Typography  variant="h3" fontWeight="600">
            Builds History Of {selectedJob}
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt="25px"
          >
            <ProgressCircle size="270" progress={(buildStatusData["Success"] / (buildStatusData["Success"] + buildStatusData["Failures"]))} secondaryColor={colors.redAccent[400]} />
            <Typography
              variant="h5"
              color={colors.greenAccent[500]}
              sx={{ mt: "15px" }}
            >
              Successful Builds : {buildStatusData["Success"]}
            </Typography>
            <Typography>Failed Builds : {buildStatusData["Failures"]}</Typography>
          </Box>
        </Box>
        <Box
          gridColumn="span 12"
          gridRow="span 3"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h3" fontWeight="600">
              Jenkins Logs Of Pipeline <b>{selectedJob}</b> Build Number <b>{selectedBuild}</b>
            </Typography>
          </Box>
         <Typography color={colors.grey[100]} p="15px" sx={{whiteSpace: "pre-wrap"}} variant="h5">
          {data.logs}
         </Typography>
        </Box>
        {/* <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p="30px"
        >
          <Typography variant="h5" fontWeight="600">
            Issues
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt="25px"
          >
            <ProgressCircle size="125" progress={(openIssues-closedIssues)/100}/>
            <Typography
              variant="h5"
              color={colors.greenAccent[500]}
              sx={{ mt: "15px" }}
            >
            Open Issues : {openIssues}
            </Typography>
            <Typography>Closed Issues : {closedIssues}</Typography>
          </Box>
        </Box> */}
        {/* <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
            Sales Quantity
          </Typography>
          <Box height="250px" mt="-20px">
            <BarChart isDashboard={true} />
          </Box>
        </Box> */}
        {/* <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="30px"
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ marginBottom: "15px" }}
          >
            Geography Based Traffic
          </Typography>
          <Box height="200px">
            <GeographyChart isDashboard={true} />
          </Box>
        </Box> */}
      </Box>
    </Box>
  );
};

export default JenkinsDashboard;
