import React, { useState, useEffect } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { apiService } from "../../services/apiServices";

const PipelineWorkflow = ({ selectedJob, selectedBuild }) => {
  const [pipelineData, setPipelineData] = useState(null);

  useEffect(() => {
    if (selectedJob && selectedBuild) {
      fetchPipelineData(selectedJob, selectedBuild);
    }
  }, [selectedJob, selectedBuild]);

  const fetchPipelineData = async (jobName, buildNumber) => {
    try {
      const response = await apiService.getJenkinsBuildSteps({ jobName, buildNumber });
      setPipelineData(response.data);
    } catch (error) {
      console.error("Error fetching pipeline data:", error);
    }
  };

  if (!pipelineData) {
    return <Typography>Loading pipeline data...</Typography>;
  }

  return (
    <Box p={3} bgcolor="primary.400">
      <Typography variant="h4" fontWeight="bold" mb={2} color="grey.100">
        Pipeline Workflow for {pipelineData.jobName} (Build #{pipelineData.buildNumber})
      </Typography>

      <Box display="flex" alignItems="center" overflow="auto" p={2} sx={{ gap: 2 }}>
        {pipelineData.steps.map((step, index) => (
          <React.Fragment key={index}>
            <Paper
              elevation={3}
              sx={{
                minWidth: 200,
                p: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                bgcolor: step.status === "SUCCESS" ? "success.light" : "error.light",
                color: "white",
                borderRadius: 2,
                position: "relative",
              }}
            >
              {step.status === "SUCCESS" ? (
                <CheckCircle sx={{ color: "green", position: "absolute", top: 5, right: 5 }} />
              ) : (
                <Cancel sx={{ color: "red", position: "absolute", top: 5, right: 5 }} />
              )}
              <Typography variant="h6" fontWeight="bold" color="black">
                {step.name}
              </Typography>
              <Typography variant="body2" color="black">Duration: {step.duration}ms</Typography>
              <Paper elevation={2} sx={{ p: 1, mt: 1, bgcolor: "grey.800", width: "100%" }}>
                <Typography variant="body2" color="grey.100">
                  {step.logs || "No logs available"}
                </Typography>
              </Paper>
            </Paper>

            {/* Render connecting line except after last step */}
            {index < pipelineData.steps.length - 1 && (
              <Box sx={{ width: 50, height: 4, bgcolor: "grey.300" }} />
            )}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

export default PipelineWorkflow;
