const { Server } = require("socket.io");
const corsConfig = require("./cors.config");
const userModel = require("./models/user");
const captainModel = require("./models/captian.model");
const rideModel = require("./models/ride.model");

let io;
const rideSearchRadiusInKm = 2;
const earthRadiusInKm = 6371;

function getRideSearchBounds(latitude, longitude) {
  const latitudeDelta = (rideSearchRadiusInKm / earthRadiusInKm) * (180 / Math.PI);
  const longitudeDelta = latitudeDelta / Math.cos((latitude * Math.PI) / 180);
  return {
    minLatitude: latitude - latitudeDelta,
    maxLatitude: latitude + latitudeDelta,
    minLongitude: longitude - longitudeDelta,
    maxLongitude: longitude + longitudeDelta
  };
}

function isWithinRideSearchRadius(captainLocation, pickupLocation) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const latitudeDifference = toRadians(pickupLocation.ltd - captainLocation.ltd);
  const longitudeDifference = toRadians(pickupLocation.lng - captainLocation.lng);
  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(captainLocation.ltd)) *
      Math.cos(toRadians(pickupLocation.ltd)) *
      Math.sin(longitudeDifference / 2) ** 2;
  const distanceInKm =
    2 * earthRadiusInKm * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return distanceInKm <= rideSearchRadiusInKm;
}

async function dispatchPendingRidesToCaptain(socket, location) {
  const bounds = getRideSearchBounds(location.ltd, location.lng);
  const pendingRides = await rideModel.find({
    status: "pending",
    "pickupLocation.ltd": { $gte: bounds.minLatitude, $lte: bounds.maxLatitude },
    "pickupLocation.lng": { $gte: bounds.minLongitude, $lte: bounds.maxLongitude }
  }).populate("user", "fullname");

  for (const ride of pendingRides) {
    const rideId = ride._id.toString();
    if (
      socket.data.notifiedRideIds.has(rideId) ||
      !isWithinRideSearchRadius(location, ride.pickupLocation)
    ) {
      continue;
    }

    const rideData = ride.toObject();
    delete rideData.otp;
    socket.emit("new-ride", rideData);
    socket.data.notifiedRideIds.add(rideId);
  }
}

async function markCaptainOffline(userId, socketId, disconnect = false) {
  const captain = await captainModel.findOne({ _id: userId, socketId })
    .select("status onlineSince");
  if (!captain) return;

  const update = {
    $set: { status: "inactive" },
    $unset: { onlineSince: 1 }
  };
  if (disconnect) update.$unset.socketId = 1;
  if (captain.status === "active" && captain.onlineSince) {
    update.$inc = {
      totalOnlineSeconds: Math.max(
        0,
        Math.floor((Date.now() - captain.onlineSince.getTime()) / 1000)
      )
    };
  }

  await captainModel.findOneAndUpdate(
    { _id: userId, socketId, status: captain.status },
    update
  );
}

function initializeSocket(server) {
  io = new Server(server, {
    cors: corsConfig,
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    let joinedCaptainId;
    let joinedUserId;

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
        const update = userType === "captain"
          ? { $set: { socketId: socket.id } }
          : { $set: { socketId: socket.id } };
        const account = await model.findByIdAndUpdate(
          userId,
          update,
          { returnDocument: "after", projection: { _id: 1, status: 1 } }
        );

        if (!account) {
          socket.emit("join:error", { message: "Account not found" });
          return;
        }

        if (userType === "captain") {
          joinedCaptainId = userId;
          socket.data.captainId = userId;
          socket.data.isCaptainOnline = account.status === "active";
          socket.data.announcedOnline = false;
          socket.data.notifiedRideIds = new Set();
        } else {
          joinedUserId = userId;
        }

        socket.emit("join:success", {
          userId,
          socketId: socket.id,
          userType,
          ...(userType === "captain" ? { status: account.status } : {})
        });
      } catch (error) {
        console.error(`Failed to register ${userType} socket:`, error);
        socket.emit("join:error", { message: "Could not register socket connection" });
      }
    });

    socket.on("captain-availability", async (data) => {
      const { userId, isOnline } = data || {};
      if (
        !userId ||
        socket.data.captainId !== userId ||
        typeof isOnline !== "boolean"
      ) {
        socket.emit("availability:error", {
          message: "A connected captain account and availability status are required"
        });
        return;
      }

      try {
        if (!isOnline) {
          const activeRide = await rideModel.exists({
            captain: userId,
            status: { $in: ["accepted", "ongoing"] }
          });
          if (activeRide) {
            socket.emit("availability:error", {
              message: "Finish your active ride before going offline."
            });
            return;
          }

          socket.data.isCaptainOnline = false;
          socket.data.announcedOnline = false;
          socket.data.notifiedRideIds.clear();
          await markCaptainOffline(userId, socket.id);
          const captain = await captainModel.findById(userId).select("status");

          if (!captain) {
            socket.emit("availability:error", { message: "Captain account is not connected" });
            return;
          }

          socket.emit("availability:updated", {
            userId,
            status: captain.status,
            isOnline: false
          });
          return;
        }

        socket.data.isCaptainOnline = true;
        socket.emit("availability:updated", {
          userId,
          status: "inactive",
          isOnline: false,
          awaitingLocation: true
        });
      } catch (error) {
        console.error("Failed to update captain availability:", error);
        socket.emit("availability:error", {
          message: "Could not update your online status. Please try again."
        });
      }
    });

    socket.on('update-location-captain',async(data)=> {
      const { userId, location } = data || {};
      const { lat, ltd, lng } = location || {};
      const latitude = ltd ?? lat;

      if (
        !userId ||
        socket.data.captainId !== userId ||
        !socket.data.isCaptainOnline ||
        !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
        !Number.isFinite(lng) || lng < -180 || lng > 180
      ) {
        socket.emit("location:error", { message: "A valid userId and location coordinates are required" });
        return;
      }

      try {
        let captain = await captainModel.findOneAndUpdate(
          {
            _id: userId,
            socketId: socket.id,
            $or: [{ status: { $ne: "active" } }, { onlineSince: { $exists: false } }]
          },
          {
            $set: {
              "location.ltd": latitude,
              "location.lng": lng,
              status: "active",
              onlineSince: new Date()
            }
          },
          { returnDocument: "after" }
        );
        if (!captain) {
          captain = await captainModel.findOneAndUpdate(
            { _id: userId, socketId: socket.id, status: "active" },
            {
              $set: {
                "location.ltd": latitude,
                "location.lng": lng
              }
            },
            { returnDocument: "after" }
          );
        }

        if (!captain) {
          socket.emit("location:error", { message: "Captain not found" });
          return;
        }

        if (!socket.data.isCaptainOnline) {
          await markCaptainOffline(userId, socket.id);
          return;
        }

        socket.emit("location:updated", {
          userId,
          location: { ltd: latitude, lng },
        });
        if (!socket.data.announcedOnline) {
          socket.data.announcedOnline = true;
          socket.emit("availability:updated", {
            userId,
            status: "active",
            isOnline: true
          });
        }

        const activeRide = await rideModel.findOne({
          captain: userId,
          status: { $in: ["accepted", "ongoing"] }
        }).populate("user", "socketId");

        if (!activeRide) {
          await dispatchPendingRidesToCaptain(socket, { ltd: latitude, lng });
        }

        if (activeRide?.user?.socketId) {
          sendMessageToSocketId(activeRide.user.socketId, {
            event: "captain-location",
            data: {
              rideId: activeRide._id,
              location: { ltd: latitude, lng }
            }
          });
        }
      } catch (error) {
        console.error("Failed to update captain location:", error);
        socket.emit("location:error", { message: "Could not update captain location" });
      }
    });

    socket.on("location-unavailable", async (data) => {
      const { userId } = data || {};
      if (!userId || socket.data.captainId !== userId) {
        socket.emit("location:error", { message: "A connected captain account is required" });
        return;
      }

      try {
        socket.data.isCaptainOnline = false;
        socket.data.announcedOnline = false;
        await markCaptainOffline(userId, socket.id);
        socket.emit("availability:updated", {
          userId,
          status: "inactive",
          isOnline: false
        });
      } catch (error) {
        console.error("Failed to mark captain location unavailable:", error);
        socket.emit("location:error", { message: "Could not update your location status" });
      }
    });

    socket.on("disconnect", () => {
      if (joinedCaptainId) {
        socket.data.isCaptainOnline = false;
        markCaptainOffline(joinedCaptainId, socket.id, true).catch((error) => {
          console.error(`Failed to mark captain ${joinedCaptainId} offline:`, error);
        });
      }
      if (joinedUserId) {
        userModel.findOneAndUpdate(
          { _id: joinedUserId, socketId: socket.id },
          { $unset: { socketId: 1 } }
        ).catch((error) => {
          console.error(`Failed to clear user ${joinedUserId} socket:`, error);
        });
      }
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
