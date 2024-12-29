// Import required modules
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

// Initialize Express application and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO for real-time communication
const io = new Server(server);

// Serve static files from the client directory
app.use(express.static("client"));

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // Handle offer messages from clients
  socket.on("offer", (data) => {
    socket.broadcast.emit("offer", data);
  });

  // Handle answer messages from clients
  socket.on("answer", (data) => {
    socket.broadcast.emit("answer", data);
  });

  // Handle ICE candidates for NAT traversal
  socket.on("ice-candidate", (data) => {
    socket.broadcast.emit("ice-candidate", data);
  });

  // Handle user-provided names and forward them to peers
  socket.on("remote-name", (name) => {
    socket.broadcast.emit("remote-name", name);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

// Start the server
server.listen(3000, () => {
  console.log(`Server is running on http://localhost:${3000}`);
});
