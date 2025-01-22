const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Set the view engine to EJS
app.set("view engine", "ejs");

// Handle Socket.IO connections
io.on("connection", (socket) => {
    //console.log("A user connected:", socket.id);

    // Listen for location updates from the client
    socket.on("send-location", (data) => {
        // Broadcast the location to all other clients
        io.emit("receive-location", { id: socket.id, ...data });
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
       // console.log("A user disconnected:", socket.id);
        // Notify other clients that this user has disconnected
        io.emit("user-disconnected", socket.id);
    });
});

// Render the main view
app.get("/", (req, res) => {
    res.render("view");
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});