import React, { useEffect, useState, useRef } from "react";
import { apiService } from "../services/apiServices";
import {
    Container,
    Typography,
    Select,
    MenuItem,
    Button,
    FormControl,
    InputLabel,
    Grid,
    Card,
    CardContent,
    TextField,
    CircularProgress,
} from "@mui/material";

const AnalyzeAndChat = () => {
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState("");
    const [buildNumbers, setBuildNumbers] = useState([]);
    const [selectedBuild, setSelectedBuild] = useState("");
    const [chatMessages, setChatMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [chatLoading, setChatLoading] = useState(false); // New state for chat loading
    const chatEndRef = useRef(null);

    useEffect(() => {
        fetchJenkinsJobs();
    }, []);

    useEffect(() => {
        if (selectedJob) {
            fetchBuildNumbers(selectedJob);
        }
    }, [selectedJob]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    const fetchJenkinsJobs = async () => {
        try {
            const response = await apiService.getJenkinsJobs();
            setJobs(response.data.jobs);
        } catch (error) {
            console.error("Error fetching Jenkins jobs:", error);
        }
    };

    const fetchBuildNumbers = async (jobName) => {
        try {
            const response = await apiService.getJenkinsBuildHistory({ jobName });
            setBuildNumbers(response.data.builds);
        } catch (error) {
            console.error("Error fetching build numbers:", error);
        }
    };

    const analyzePipeline = async () => {
        try {
            setChatMessages([]); // Clear chat
            setLoading(true);

            const response = await apiService.analyzePipeline({
                jobName: selectedJob,
                buildNumber: selectedBuild,
            });

            setChatMessages([{ sender: "System", text: sanitizeResponse(response.data) }]);
        } catch (error) {
            console.error("Error analyzing pipeline:", error);
        } finally {
            setLoading(false);
        }
    };

    const sanitizeResponse = (text) => {
        return text.replace(/<think>.*?<\/think>/gs, "").trim();
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || chatLoading) return; // Prevent sending if already waiting

        const newMessage = { sender: "User", text: inputMessage };
        setChatMessages((prevMessages) => [...prevMessages, newMessage]);
        setInputMessage("");
        setChatLoading(true); // Set loading state for chat

        try {
            // Show "AI is typing..." message
            setChatMessages((prevMessages) => [
                ...prevMessages,
                { sender: "AI", text: "AI is typing...", isTyping: true }
            ]);

            const response = await apiService.chatWithAnalysis({
                jobName: selectedJob,
                buildNumber: selectedBuild,
                message: inputMessage,
                message_log: chatMessages.map((msg) => ({
                    role: msg.sender === "User" ? "user" : "AI",
                    content: msg.text,
                })),
            });

            const aiMessage = { sender: "AI", text: sanitizeResponse(response.data.response) };

            // Replace "AI is typing..." with the actual response
            setChatMessages((prevMessages) =>
                prevMessages.map((msg) => (msg.isTyping ? aiMessage : msg))
            );
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setChatLoading(false);
        }
    };

    return (
        <Container sx={{ p: 4, borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
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

                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Select Build</InputLabel>
                        <Select value={selectedBuild} onChange={(e) => setSelectedBuild(e.target.value)}>
                            {buildNumbers.map((build) => (
                                <MenuItem key={build.number} value={build.number}>
                                    {build.number}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={analyzePipeline}
                        disabled={loading || !selectedJob || !selectedBuild}
                    >
                        {loading ? <CircularProgress size={24} /> : "Analyze Pipeline"}
                    </Button>
                </Grid>
            </Grid>

            {/* Chat Window */}
            <Card sx={{ mt: 4, borderRadius: 2, boxShadow: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        Chat Window
                    </Typography>

                    <div
                        style={{
                            height: "350px",
                            overflowY: "auto",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            padding: "10px",
                            backgroundColor: "#fff",
                        }}
                    >
                        {chatMessages.map((msg, index) => (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    justifyContent: msg.sender === "User" ? "flex-end" : "flex-start",
                                    marginBottom: "10px",
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: "70%",
                                        padding: "10px",
                                        borderRadius: "10px",
                                        backgroundColor: msg.sender === "User" ? "#1976d2" : "#e0e0e0",
                                        color: msg.sender === "User" ? "#fff" : "#000",
                                        textAlign: "left",
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                                        {msg.sender}
                                    </Typography>
                                    <Typography variant="body2" style={{ whiteSpace: "pre-line" }}>
                                        {msg.text}
                                    </Typography>
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={10}>
                            <TextField
                                fullWidth
                                placeholder="Type a message..."
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                disabled={chatLoading}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "25px",
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <Button
                                variant="contained"
                                color="secondary"
                                fullWidth
                                onClick={sendMessage}
                                disabled={!inputMessage.trim() || chatLoading}
                                sx={{ height: "100%", borderRadius: "25px" }}
                            >
                                {chatLoading ? <CircularProgress size={20} color="inherit" /> : "Send"}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Container>
    );
};

export default AnalyzeAndChat;
