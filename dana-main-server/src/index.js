const express = require("express");
require("./database/connect");
const cors = require("cors");
const userRouter = require("./router/user.router");
const http = require("http");

const app = express();
const port = process.env.PORT || 8088;
const host = process.env.HOST || "http://localhost";

// Swagger setup
const apiVersionPrefix = "/api/v1";

// Middleware for parsing JSON and enabling CORS
app.use(express.json());
app.use(cors());

// Create HTTP server
const server = http.createServer(app);

// Store SSE clients
let clients = [];

// SSE endpoint
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  console.log("New SSE connection established");

  // Send a welcome message
  res.write(`{ "message": "Welcome" }`);

  // Add client to the list
  clients.push(res);

  // Remove client when they disconnect
  req.on("close", () => {
    console.log("Client disconnected");
    clients = clients.filter((client) => client !== res);
  });
});

// Function to send data to all connected clients
const sendSSEMessage = (data) => {
  clients.forEach((client) => client.write(`data: ${JSON.stringify(data)}\n\n`));
};

// Task notification endpoint
app.post("/notify-task", (req, res) => {
  const { task, status } = req.body;

  // Send update to all SSE clients
  sendSSEMessage({ task, status });

  res.json({ message: "Task update sent" });
});

// Define routes
app.use("/user", userRouter);

// Start the server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
