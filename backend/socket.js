const { Server } = require("socket.io");
const corsConfig = require("./cors.config");
const userModel = require("./models/user");
const captainModel = require("./models/captian.model");

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: corsConfig,
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join", async (data) => {
      const { userId, userType } = data || {};
      const model = userType === "user"
        ? userModel
        : userType === "captain"
          ? captainModel
          : null;

      if (!model || !userId) {
        socket.emit("join:error", { message: "A valid userId and userType are required" });
        return;
      }

      try {
        const account = await model.findByIdAndUpdate(
          userId,
          { socketId: socket.id },
          { returnDocument: "after", projection: { _id: 1 } }
        );

        if (!account) {
          socket.emit("join:error", { message: "Account not found" });
          return;
        }

        socket.emit("join:success", { userId, socketId: socket.id, userType });
      } catch (error) {
        console.error(`Failed to register ${userType} socket:`, error);
        socket.emit("join:error", { message: "Could not register socket connection" });
      }
    });

    socket.on('update-location-captain',async(data)=> {
      const { userId, location } = data || {};
      const { ltd, lng } = location || {};

      if (
        !userId ||
        !Number.isFinite(ltd) || ltd < -90 || ltd > 90 ||
        !Number.isFinite(lng) || lng < -180 || lng > 180
      ) {
        socket.emit("location:error", { message: "A valid userId and location coordinates are required" });
        return;
      }

      await captainModel.findByIdAndUpdate(userId, { location: {
        ltd : location.ltd,
        lng: location.lng
      } })
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function sendMessageToSocketId(socketId, messageObject) {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  if (!socketId || !messageObject?.event) {
    throw new Error("A socket ID and event are required");
  }

  io.to(socketId).emit(messageObject.event, messageObject.data);
}

module.exports = { initializeSocket, sendMessageToSocketId };
