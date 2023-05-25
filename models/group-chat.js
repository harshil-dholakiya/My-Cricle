const mongoose = require("mongoose");
let groupChatModel = function () {
    const options = {
        collection: "groupChat",
        timestamps: {
            createdAt: "createdOn",
            updatedAt: "updatedOn",
        },
    };
    const groupChatSchema = new mongoose.Schema({
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        memberId: {
            type: Object,   
            ref: "users"
        },
        groupName: {
            type: String,
            default: false
        }
    }, options)
    return mongoose.model("groupChat", groupChatSchema);
};

module.exports = groupChatModel();