import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";

const port = 5000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors());

app.get("/", (req, res) => {
  res.send("Modi MC");
});

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("join-room", (room, username) => {
    socket.join(room);
    socket.username = username;
    console.log(socket.id, "joined room", room);
    io.to(room).emit("user-joined", socket.username);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
    const rooms = Array.from(socket.rooms);
    rooms.forEach((room) => {
      if (room !== socket.id) {
        io.to(room).emit("user-left", socket.username);
      }
    });
  });

  socket.on("message", ({ sender, text, room }) => {
    console.log(text);
    io.to(room).emit("recieve-message", { sender, text });
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
