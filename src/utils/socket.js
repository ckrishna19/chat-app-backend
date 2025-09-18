import { Server } from "socket.io";
const userMap = {};

const socketConnection = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    userMap[userId] = socket.id;
    socket.userId = userId;
    socket.on("send-msg", (data) => {
      const { receivedBy } = data?.newMessage;
      const receiverSocketId = userMap[receivedBy];
      io.to(receiverSocketId).emit("rcv-msg", data);
    });

    io.emit("online-user", userMap);

    // call video
    socket.on("call-user", ({ targetUser, caller, offer }) => {
      //    const targetSocketId = users.get(targetUser);
      const targetSocketId = userMap[targetUser];
      if (targetSocketId) {
        io.to(targetSocketId).emit("incoming-call", {
          caller,
          offer,
        });
        console.log(`Call from ${caller} to ${targetUser} sent`);
      } else {
        console.log(`Call failed: targetUser ${targetUser} not found`);
        socket.emit("call-error", { message: "User not available" });
      }
    });

    socket.on("accept-call", ({ caller, answer }) => {
      //    const callerSocketId = users.get(caller);
      const callerSocketId = userMap[caller];
      if (callerSocketId) {
        io.to(callerSocketId).emit("call-accepted", { answer });
        console.log(`Call accepted sent to ${caller}`);
      }
    });

    socket.on("decline-call", ({ caller }) => {
      //  const callerSocketId = users.get(caller);
      const callerSocketId = userMap[caller];
      if (callerSocketId) {
        io.to(callerSocketId).emit("call-declined");
        console.log(`Call declined sent to ${caller}`);
      }
    });

    socket.on("ice-candidate", ({ targetUser, candidate }) => {
      //  const targetSocketId = users.get(targetUser);
      const targetSocketId = userMap[targetUser];
      if (targetSocketId) {
        io.to(targetSocketId).emit("ice-candidate", { candidate });
        // console.log(`ICE candidate sent to ${targetUser}`);
      }
    });

    socket.on("end-call", ({ targetUser }) => {
      //    const targetSocketId = users.get(targetUser);
      const targetSocketId = userMap[targetUser];
      if (targetSocketId) {
        io.to(targetSocketId).emit("call-ended");
        console.log(`Call ended sent to ${targetUser}`);
      }
    });

    socket.on("disconnect", () => {
      if (socket?.userId && userMap[socket.userId]) {
        delete userMap[socket.userId];
      }
      console.log("userMap in disconnect function:", userMap);
    });
  });
};

export default socketConnection;
