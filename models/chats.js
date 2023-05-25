const mongoose = require("mongoose");
let chatModel = function () {
    const options = {
        collection: "chats",
        timestamps: {
            createdAt: "createdOn",
            updatedAt: "updatedOn",
        },
    };
    const chatSchema = new mongoose.Schema({
        chatMessage: {
            type: String,
            required: true
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        isSeen:{
            type : Boolean,
            default : false
        },
        chatWith: {
            type: String,
            enum: ["individual", "group"],
            default: "individual"
        },
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "groupChat"
        },
    }, options)
    return mongoose.model("chats", chatSchema);
};

module.exports = chatModel();