import React, { useState, useEffect } from "react";
import { Box, TextField, IconButton, Typography, useTheme } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { tokens } from "../theme";
import { apiService } from "../services/apiServices";

const InputBox = ({ handleSend, response, sanitizeResponse }) => {
  const [inputMessage, setInputMessage] = useState("");
  const [chatMessages, setChatMessages] = useState(response || []);
  const [chatLoading, setChatLoading] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Update chatMessages when response changes
  useEffect(() => {
    if (response) {
      setChatMessages(response);
    }
  }, [response]);

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
        { sender: "AI", text: "AI is typing...", isTyping: true },
      ]);

      const response = await apiService.chatWithAnalysis({
        message: inputMessage,
        message_log: chatMessages.map((msg) => ({
          role: msg.sender === "User" ? "user" : "ai",
          content: msg.text,
        })),
      });

      const aiMessage = { sender: "AI", text: sanitizeResponse(response.data.response) };

      // Replace "AI is typing..." with the actual response
      setChatMessages((prevMessages) =>
        prevMessages.filter((msg) => !msg.isTyping).concat(aiMessage)
      );
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <Box gridRow="span 4" display="flex" flexDirection="column" height="100%">
      {/* Chat Window */}
      <Box
        sx={{
          flexGrow: 1,
          maxHeight: "500px",
          overflowY: "auto",
          p: 2,
          borderBottom: "1px solid #ccc",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {chatMessages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              alignSelf: msg.sender === "User" ? "flex-end" : "flex-start",
              bgcolor: msg.sender === "User" ? "primary.main" : colors.grey[700],
              color: msg.sender === "User" ? "white" : colors.primary[100],
              px: 2,
              py: 1,
              borderRadius: 2,
              maxWidth: "75%",
            }}
          >
            <Typography variant="h6" sx={{ whiteSpace: "pre-wrap" }}>{msg.text}</Typography>
          </Box>
        ))}
      </Box>

      {/* Input Box */}
      <Box display="flex" alignItems="center" p={1}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          sx={{ mr: 1 }}
        />
        <IconButton color="info" onClick={sendMessage} disabled={chatLoading}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default InputBox;
