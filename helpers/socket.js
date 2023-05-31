module.exports = function (server) {
    global.io = require("socket.io")(server)
    io.on("connection", async (socket) => {
        let userId = socket.handshake.query.userid
        let groupId = socket.handshake.query.groupid
        socket.join(userId);
        socket.join(groupId);

        io.to(userId).emit("connectToRoom", "You are connected")
        console.log('socket', socket.id);
        console.log('socket.rooms', socket.rooms);
        console.log("socket.handshake.query.userid",socket.handshake.query.userid);
    });

}
