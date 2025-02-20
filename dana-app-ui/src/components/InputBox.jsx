import React, { useState } from "react";
import { Box, TextField, IconButton, Typography, Paper,useTheme } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { tokens } from "../theme";

const InputBox = ({ handleSend , response}) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([response][0]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
//   setMessages(response);
  if(messages !== response){
    setMessages(response);
  }

  const sendMessage = async () => {
    // if (!message.trim()) return;

    // // Add user message to chat
    // const userMessage = { text: message, sender: "user" };
    // setMessages((prev) => [...prev, userMessage]);

    // setMessage(""); // Clear input field

    // // Get AI response
    // const aiReply = await handleSend(message);
    // if (aiReply) {
    //   const aiMessage = { text: aiReply, sender: "ai" };
    //   setMessages((prev) => [...prev, aiMessage]);
    // }
  };

  return (
    <Box gridRow="span 4">
      {/* Chat Window */}
      <Box 
        sx={{ 
          // maxHeight: 250, 
          overflowY: "auto", 
          p: 1, 
          borderBottom: "1px solid #ccc",
          display: "flex", 
          flexDirection: "column",
          gap: 1
        }}
      >
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              bgcolor: msg.sender === "user" ? "primary.main" : colors.grey[700],
              color: msg.sender === "user" ? "white" : colors.primary[100],
              px: 2,
              py: 1,
              borderRadius: 2,
              maxWidth: "75%",
            }}
          >
            <Typography variant="h5" sx={{whiteSpace: "pre-wrap"}}>{msg.text}</Typography>
          </Box>
        ))}
      </Box>

      {/* Input Box */}
      <Box display="flex" alignItems="center" mt={1} alignContent={"baseline"}>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          sx={{ mr: 1 }}
        />
        <IconButton color="secondary" onClick={sendMessage}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default InputBox;
