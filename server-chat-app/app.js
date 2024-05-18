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
  max: 10, // 10 requests per minute
  delayMs: 0, // no delay
});
let usersInRoom = {};

app.use(limiter);

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("join-room", ({ room, username }) => {
    if (username) {
      socket.join(room);
      if (!usersInRoom[room]) {
        usersInRoom[room] = [];
      }
      usersInRoom[room].push({ id: socket.id, username });
      console.log(username, "joined room", room);
      socket.broadcast.to(room).emit("user-joined", username);
      io.to(room).emit("update-users", usersInRoom[room]);
    }
  });

  socket.on("leave-room", ({ room, username }) => {
    if (username) {
      socket.leave(room);
      usersInRoom[room] = usersInRoom[room].filter(
        (user) => user.id !== socket.id
      );
      console.log(username, "left room", room);
      socket.broadcast.to(room).emit("user-left", username);
      io.to(room).emit("update-users", usersInRoom[room]);
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
    for (const room in usersInRoom) {
      usersInRoom[room] = usersInRoom[room].filter(
        (user) => user.id !== socket.id
      );
      const user = usersInRoom[room].find((user) => user.id === socket.id);
      if (user) {
        socket.broadcast.to(room).emit("user-left", user.username);
      }
      io.to(room).emit("update-users", usersInRoom[room]);
    }
  });

  socket.on("message", ({ sender, text, room }) => {
    console.log(text);
    io.to(room).emit("receive-message", { sender, text });
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
