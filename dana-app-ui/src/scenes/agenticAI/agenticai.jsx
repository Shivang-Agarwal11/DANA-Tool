import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";
import { apiService } from "../../services/apiServices";

const AgenticAI = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [issueText, setIssueText] = useState("");
  const [loading, setLoading] = useState(false);
  const [issueLink, setIssueLink] = useState(null);
  const [updates,setUpdates] = useState([]);
  const handleCreateIssue = async () => {
    if (!issueText.trim()) return;
    setUpdates([]);
    setIssueLink([]);
    setLoading(true);
    try {
      const response = await apiService.createGithubIssue({ issue_text: issueText });
      setIssueLink(response.data);
    } catch (error) {
      console.error("Error creating GitHub issue:", error);
    } finally {
      setLoading(false);
    }
  };
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
  const handleAnalyzeCommit = async () => {
    setLoading(true);
    try {
      const response = await apiService.analyzeLastCommit();
      setIssueLink(response.data.issueUrl);
    } catch (error) {
      console.error("Error analyzing last commit:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box m={4}>
      <Typography variant="h4" color={colors.greenAccent[500]} gutterBottom>
        Agentic AI
      </Typography>

      {/* GitHub Agentic AI Section */}
      <Box p={3} borderRadius={2} boxShadow={2} bgcolor={colors.primary[500]}>
        <Typography variant="h5" color={colors.blueAccent[500]} gutterBottom>
          GitHub Agentic AI
        </Typography>
        <TextField
          label="Describe the issue"
          multiline
          rows={4}
          variant="outlined"
          fullWidth
          value={issueText}
          onChange={(e) => setIssueText(e.target.value)}
          sx={{ backgroundColor: colors.primary[400], color: colors.grey[100], mb:2}}
        />
         <Box flexDirection="column" p="15px" gridColumn="span 12" marginTop={0} display="flex" gridRow={updates.length==2? "span 2" : updates.length>=3?"span 3":"span 1"}>
          {updates.length > 0 && updates.map((msg, index) => (
              <Typography 
              color="rgba(255, 255, 255, 0.81)" // White text for high contrast
              variant="h5" 
              fontWeight="900" 
              backgroundColor="#4A4A4A" // Darker gray for better visibility
              p={2} 
              mt={1}
              key={index} 
              textAlign="center" 
              borderRadius={5} 
              // border="2px solid rgb(244, 245, 246)" // Gold border for a subtle highlight
              sx={{ 
                textShadow: "2px 2px 4px rgba(26, 12, 12, 0.5)", // Adds text shadow for better readability
              }}
            >
              AI Agent performing task: {msg.task} {msg.status}
            </Typography>
            
            ))}
          </Box>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleCreateIssue}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : "Create Issue"}
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleAnalyzeCommit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Analyze Last Commit"}
        </Button>
        {issueLink && (
          <Typography variant="h5" mt={2}>
            Issue Created: <a href={issueLink} target="_blank" style={{ textDecoration:"none" , color: colors.grey[300]}}rel="noopener noreferrer">{issueLink}</a>
          </Typography>
        )}
      </Box>

      {/* Jenkins Agentic AI Section (Placeholder) */}
      <Box mt={4} p={3} borderRadius={2} boxShadow={2} bgcolor={colors.primary[500]}>
        <Typography variant="h5" color={colors.blueAccent[500]} gutterBottom>
          Jenkins Agentic AI
        </Typography>
        <Typography variant="body1" color={colors.grey[300]}>
          Coming Soon...
        </Typography>
      </Box>
    </Box>
  );
};

export default AgenticAI;
