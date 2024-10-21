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
const rooms = new Map();

app.use(limiter);

io.on("connection", (socket) => {
  console.log("User  connected", socket.id);

  socket.on("join-room", ({ room, username, password }) => {
    if (username) {
      const roomInfo = rooms.get(room);

      // If room doesn't exist, create it as public
      if (!roomInfo) {
        // If room doesn't exist, create it as public or private based on the password
        const isPrivate = password ? true : false;
        rooms.set(room, {
          name: room,
          isPrivate: isPrivate,
          password: password || null,
          userCount: 0,
        });
      } else if (roomInfo.isPrivate && roomInfo.password !== password) {
        // Check password for private rooms
        socket.emit("join-error", "Incorrect password");
        return;
      }

      socket.join(room);
      if (!usersInRoom[room]) {
        usersInRoom[room] = [];
      }
      usersInRoom[room].push({ id: socket.id, username });

      const updatedRoomInfo = rooms.get(room);
      updatedRoomInfo.userCount = usersInRoom[room].length;
      rooms.set(room, updatedRoomInfo);

      // Emit updated room list
      io.emit(
        "update-rooms",
        Array.from(rooms.values()).map((room) => ({
          name: room.name,
          isPrivate: room.isPrivate,
          userCount: room.userCount,
        }))
      );

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

      // Update user count and delete room if empty
      const updatedRoomInfo = rooms.get(room);
      if (updatedRoomInfo) {
        updatedRoomInfo.userCount = usersInRoom[room].length;
        rooms.set(room, updatedRoomInfo);

        if (updatedRoomInfo.userCount === 0) {
          rooms.delete(room);
          delete usersInRoom[room];
          console.log("Room deleted:", room);
        }
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("User  Disconnected", socket.id);
    for (const room in usersInRoom) {
      usersInRoom[room] = usersInRoom[room].filter(
        (user) => user.id !== socket.id
      );
      const user = usersInRoom[room].find((user) => user.id === socket.id);
      if (user) {
        socket.broadcast.to(room).emit("user-left", user.username);
      }

      // Update user count and delete room if empty
      const updatedRoomInfo = rooms.get(room);
      if (updatedRoomInfo) {
        updatedRoomInfo.userCount = usersInRoom[room].length;
        rooms.set(room, updatedRoomInfo);

        if (updatedRoomInfo.userCount === 0) {
          rooms.delete(room);
          delete usersInRoom[room];
          console.log("Room deleted:", room);
        }
      }
    }
  });

  socket.on("message", ({ sender, text, room }) => {
    console.log(text);
    io.to(room).emit("receive-message", { sender, text });
  });

  socket.on("get-rooms", () => {
    socket.emit(
      "update-rooms",
      Array.from(rooms.values()).map((room) => ({
        name: room.name,
        isPrivate: room.isPrivate,
        userCount: room.userCount,
      }))
    );
  });

  socket.on("verify-room-password", ({ room, password }) => {
    const roomInfo = rooms.get(room);

    if (!roomInfo) {
      socket.emit("password-verify-result", {
        success: false,
        message: "Room does not exist",
      });
      return;
    }

    if (!roomInfo.isPrivate) {
      socket.emit("password-verify-result", {
        success: true,
      });
      return;
    }

    if (roomInfo.password === password) {
      socket.emit("password-verify-result", {
        success: true,
      });
    } else {
      socket.emit("password-verify-result", {
        success: false,
        message: "Incorrect password",
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
