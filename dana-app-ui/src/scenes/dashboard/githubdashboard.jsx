import { Alert, Box, Button, IconButton, Typography, useTheme } from "@mui/material";
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
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate(); 
  const colors = tokens(theme.palette.mode);

  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      
      try{
      const response = await apiService.getGithubStats();
      setStats(response.data);
      }
      catch(error){
      console.log(error)
      if(error.status == 401){
        localStorage.removeItem("authToken");
        navigate("/form");
      }
    }
    }; fetchData();
  }, []);

  if (!stats) {
    return <div>Loading...</div>;
  }

  const formatWeeklyData = (data) => {
    return data.map((entry) => ({
        date: new Date(entry.week * 1000).toLocaleDateString(), // Convert UNIX timestamp
        commits: entry.commits
    }));
};

const formatCodeFrequencyData = (data) => {
    return data.map((entry) => ({
        date: new Date(entry.timestamp * 1000).toLocaleDateString(), // Convert UNIX timestamp
        additions: entry.additions,
        deletions: Math.abs(entry.deletions) // Convert negative deletions to positive for better visualization
    }));
};
  const stripDate= (timestamp) =>{
    return timestamp.split("T")[0]; // Extracts only the YYYY-MM-DD part
  }
  const commits = stats.totalCommits;
  const contributors = stats.totalContributors;
  const views = stats.traffic.views.count;
  const countClones = stats.traffic.clones.count;
  const forks = stats.totalForks;
  const openPR = stats.openPRs;
  const closedPR = stats.closedPRs;
  const openIssues = stats.openIssues;
  const closedIssues = stats.closedIssues;
  const branches = stats.branches.total;
  const activeBranches = stats.branches.active;
  const inactiveBranches = stats.branches.inactive;

  const clonesTableData = stats.traffic.clones.clones;
  const viewsTableData = stats.traffic.views.views;
  const branchesTableData = stats.branches.activity;  
  const referrersTableData = stats.referrers;

  const weeklyCommitActivity = formatWeeklyData(stats.weeklyCommitActivity);
  const codeFrequency = formatCodeFrequencyData(stats.codeFrequency);


  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Github Dashboard" subtitle="Welcome to your Github Stats Dashboard" />
        <a href="https://github.com/Shivang-Agarwal11/DANA-Tool" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", fontSize: "20px", color: colors.greenAccent[500], border: `2px solid ${colors.greenAccent[500]}`, padding: "5px 10px", borderRadius: "5px" }}>
          Open Github Repository
        </a>

        <Box>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
          >
            <DownloadOutlinedIcon sx={{ mr: "10px" }} />
            Download Reports
          </Button>
        </Box>
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
            title={commits}
            subtitle="Total Commits Made"
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
        </Box>
        <Box
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
              Clones History
            </Typography>
          </Box>
          {clonesTableData.map((clones, i) => (
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
                  {clones.count}
                </Typography>
                <Typography color={colors.grey[100]}>
                  Clones Count
                </Typography>
              </Box>
              <Box color={colors.grey[100]}>{stripDate(clones.timestamp)}</Box>
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
                  {clones.uniques}
                </Typography>
                <Typography color={colors.grey[100]}>
                  Unique Clones
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <Box
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
          ))}
        </Box>
        <Box
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
             Branches Activity
            </Typography>
          </Box>
          {branchesTableData.map((branch, i) => (
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
                  {branch.name}
                </Typography>
                <Typography color={colors.grey[100]}>
                  Branch Name
                </Typography>
              </Box>
              {/* <Box color={colors.grey[100]}>{stripDate(clones.timestamp)}</Box> */}
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
                  {branch.active}
                </Typography>
                <Typography color={colors.grey[100]}>
                 Active Branch
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <Box
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
              Referrers
            </Typography>
          </Box>
          {referrersTableData.map((referrer, i) => (
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
                  {referrer.referrer}
                </Typography>
                <Typography color={colors.grey[100]}>
                  Referring Site
                </Typography>
              </Box>
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
                  {referrer.count}
                </Typography>
                <Typography color={colors.grey[100]}>
                  Count of Referrers
                </Typography>
              </Box>
              {/* <Box color={colors.grey[100]}>{stripDate(clones.timestamp)}</Box> */}
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
                  {referrer.uniques}
                </Typography>
                <Typography color={colors.grey[100]}>
                  Unique Referrers
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        {/* ROW 3 */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p="30px"
        >
          <Typography variant="h5" fontWeight="600">
            Pull Requests
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt="25px"
          >
            <ProgressCircle size="125" progress={(openPR-closedPR)/100}/>
            <Typography
              variant="h5"
              color={colors.greenAccent[500]}
              sx={{ mt: "15px" }}
            >
            Open PRs : {openPR}
            </Typography>
            <Typography>Closed PRs : {closedPR}</Typography>
          </Box>
        </Box>
        <Box
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
            <ProgressCircle size="125" progress={closedIssues/(closedIssues+openIssues)} secondaryColor={colors.redAccent[400]}/>
            <Typography
              variant="h5"
              color={colors.redAccent[500]}
              sx={{ mt: "15px" }}
            >
            Open Issues : {openIssues}
            </Typography>
            <Typography>Closed Issues : {closedIssues}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
