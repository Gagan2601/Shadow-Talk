import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import rateLimit from "express-rate-limit";

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

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 2, // 10 requests per minute
  delayMs: 0, // no delay
});

app.use(limiter);

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("join-room", ({ room, username }) => {
    if (username) {
      socket.join(room);
      console.log(username, "joined room", room);
      socket.broadcast.to(room).emit("user-joined", username);
    }
  });

  socket.on("leave-room", ({ room, username }) => {
    if (username) {
      socket.leave(room);
      console.log(username, "left room", room);
      socket.broadcast.to(room).emit("user-left", username);
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
    const rooms = Array.from(socket.rooms);
    rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.broadcast.to(room).emit("user-left", socket.username);
      }
    });
  });

  socket.on("message", ({ sender, text, room }) => {
    console.log(text);
    io.to(room).emit("receive-message", { sender, text });
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
