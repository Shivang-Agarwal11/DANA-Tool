import { Alert, Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { mockTransactions } from "../../data/mockData";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EmailIcon from "@mui/icons-material/Email";
import { Commit, Person, RemoveRedEye, CopyAllOutlined, ForkLeftRounded, CrisisAlertRounded, GitHub, RequestQuote, BroadcastOnHomeOutlined, BroadcastOnPersonalRounded, Alarm, AddAlertOutlined, CrisisAlert, BusAlert, TaxiAlert, AddAlertRounded, BugReportOutlined, ControlPointDuplicateOutlined, Functions, FunctionsOutlined, Code, SecurityOutlined, SecurityTwoTone } from "@mui/icons-material";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TrafficIcon from "@mui/icons-material/Traffic";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import LineChart2 from "../../components/LineChart2";
import GeographyChart from "../../components/GeographyChart";
import BarChart from "../../components/BarChart";
import StatBox from "../../components/StatBox";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Chart from "chart.js/auto";
import { apiService } from "../../services/apiServices";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Team from "../team";

const SonarDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate(); 
  const colors = tokens(theme.palette.mode);

  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      
      try{
      const response = await apiService.getSonarQubeStats();
      setStats(response.data);
      }
      catch(error){
      console.log(error)
      if(error.status == 401){
        localStorage.removeItem("danaAuthToken");
        navigate("/login");
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

function createSonarChart(callback) {
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  const labels = stats.measures.map(m => m.metric);
  const values = stats.measures.map(m => parseFloat(m.value));

  new Chart(ctx, {
    type: "bar",
    data: {
        labels: labels,
        datasets: [{
            label: "SonarQube Metrics",
            data: values,
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1
        }]
    },
    options: {
        responsive: false,
        scales: {
            x: { 
                ticks: { font: { size: 6 } } // Smaller labels on X-axis
            },
            y: { 
                ticks: { font: { size: 6 } } // Smaller labels on Y-axis
            }
        },
        plugins: {
            legend: { labels: { font: { size: 6 } } } // Reduce legend text size
        }
    }
});

  setTimeout(() => {
      const chartImage = canvas.toDataURL("image/png");
      document.body.removeChild(canvas);
      callback(chartImage);
  }, 1000);
}
const severityColors = {
  "BLOCKER": [255, 0, 0],      // Red
  "CRITICAL": [255, 85, 85],   // Light Red
  "MAJOR": [255, 165, 0],      // Orange
  "MINOR": [255, 255, 153],    // Yellow
  "INFO": [200, 200, 200]      // Light Gray
};
function handleDownload() {
  createSonarChart((chartImage) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text("SonarQube Analysis Report", 14, 15);

    // Project Name
    doc.setFontSize(12);
    doc.text(`Project: ${stats.project}`, 14, 25);

    // Quality Gate Status
    doc.setFontSize(12);
    doc.setTextColor(stats.qualityGateStatus === "ERROR" ? "red" : "green");
    doc.text(`Quality Gate Status: ${stats.qualityGateStatus}`, 14, 35);

    // Add Chart Image
    doc.addImage(chartImage, "PNG", 14, 40, 180, 70);

    // Add Issues Table
    const issueRows = stats.issues.map(issue => [issue.severity, issue.message]);
    doc.setTextColor(0, 0, 0);
    doc.text("Issues:", 14, 120);
    autoTable(doc, {
        startY: 125,
        head: [["Severity", "Message"]],
        body: issueRows,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
        columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 150 } },
        didParseCell: function (data) {
          if (data.section === 'body' && data.column.index === 0) {
              const severity = data.cell.raw;
              if (severityColors[severity]) {
                  data.cell.styles.fillColor = severityColors[severity]; // Apply color based on severity
              }
          }
      } // Adjusted column width
    });

    // Add Security Hotspots Table
    const hotspotRows = stats.securityHotspots.map(hotspot => [hotspot.message, hotspot.status]);
    doc.text("Security Hotspots:", 14, doc.lastAutoTable.finalY + 10);
    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [["Message", "Status"]],
        body: hotspotRows,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [192, 57, 43], textColor: 255, fontStyle: "bold" },
        columnStyles: { 0: { cellWidth: 150 }, 1: { cellWidth: 30 } } // Adjusted column width
    });

    // Save PDF
    doc.save("SonarQube_Report.pdf");
});
}
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
  const coverage = stats.measures.find((measure) => measure.metric === "coverage").value;
  const bugs = stats.measures.find((measure) => measure.metric === "bugs").value;
  const complexity = stats.measures.find((measure) => measure.metric === "complexity").value;
  const code_smells = stats.measures.find((measure) => measure.metric === "code_smells").value;
  const duplicated_lines_density = stats.measures.find((measure) => measure.metric === "duplicated_lines_density").value;
  const functions = stats.measures.find((measure) => measure.metric === "functions").value;
  const ncloc = stats.measures.find((measure) => measure.metric === "ncloc").value;
  const violations = stats.measures.find((measure) => measure.metric === "violations").value;
  const vulnerabilities = stats.measures.find((measure) => measure.metric === "vulnerabilities").value;
  const security_hotspots = stats.measures.find((measure) => measure.metric === "security_hotspots").value;
  const issue_table = stats.issues;
  const rules_table = stats.rules;
  const securityHotspots_table = stats.securityHotspots;
  const qualityGateStatus = stats.qualityGateStatus;


  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="SonarQube Dashboard" subtitle="Welcome to your SonarQube Stats Dashboard" />
        <a href="http://localhost:9000" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", fontSize: "20px", color: colors.greenAccent[500], border: `2px solid ${colors.greenAccent[500]}`, padding: "5px 10px", borderRadius: "5px" }}>
          Open SonarQube 
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
            onClick={handleDownload}
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
            title={coverage}
            subtitle="Code Coverage"
            progress={coverage}
            colorTheme="true"
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
            title={bugs}
            subtitle="Bugs"
            // progress={bugs}
            // increase="+21%"
            icon={
              <BugReportOutlined
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
            title={complexity}
            subtitle="Complexity"
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
            title={code_smells}
            subtitle="Code Smells"
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
            title={duplicated_lines_density}
            subtitle="Duplicated Lines Density"
            progress={1-duplicated_lines_density/100}
            // increase={100-duplicated_lines_density}
            colorTheme="true"
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
            title={functions}
            subtitle="Total Functions"
            // progress="0.80"
            // increase="+43%"
            icon={
              <FunctionsOutlined
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
            title={ncloc}
            subtitle="Number of Lines of Code"
            // progress="0.80"
            // increase="+43%"
            icon={
              <Code
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
            title={violations}
            subtitle="Rule Violations Count"
            // progress="0.80"
            colorTheme="true"
            textColor="true"
            // increase="+43%"
            icon={
              <AddAlertOutlined
                sx={{ color: colors.redAccent[600], fontSize: "26px" }}
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
            title={vulnerabilities}
            subtitle="Security Vulnerabilities Count"
            // progress="0.80"
            // increase="+43%"
            icon={
              <SecurityOutlined
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
            title={security_hotspots}
            subtitle="Security Hotspots Count"
            // progress="0.80"
            // increase="+43%"
            icon={
              <SecurityTwoTone
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
          <Typography
            variant="h3"
            fontWeight="700"
            color={qualityGateStatus==="OK"?colors.greenAccent[600]:colors.redAccent[600]}
            sx={{ textAlign: "center" }}
          >
            {qualityGateStatus} <Typography sx={{ marginTop:"10px"}} color={colors.primary[100]} variant="h5">Quality Gate Status</Typography>
          </Typography>
        </Box>
        <Box
          gridColumn="span 6"
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
              Issues Table
            </Typography>
          </Box>
          <Team data={issue_table} type_table="issues"/>
        </Box>
        <Box
          gridColumn="span 6"
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
              Rules Table
            </Typography>
          </Box>
          <Team data={rules_table} type_table="rules"/>
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
              Security Hotspots Table
            </Typography>
          </Box>
          <Team data={securityHotspots_table} type_table="security"/>
        </Box>
      </Box>
    </Box>
  );
};

export default SonarDashboard;
