module.exports = function (server) {
    global.io = require("socket.io")(server)
    io.on("connection", async (socket) => {
        let userId = socket.handshake.query.userId
        socket.join(userId);
        io.to(userId).emit("connectToRoom", "You are connected")
    });
}
