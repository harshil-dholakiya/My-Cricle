const mongoose = require("mongoose");
let notificationModel = function () {
    const options = {
        collection: "notifications",
        timestamps: {
            createdAt: "createdOn",
            updatedAt: "updatedOn",
        },
    };
    const notificationSchema = new mongoose.Schema({
        isSeen: {
            type: Boolean,
            default : false
        },
        postId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "posts"
        },
        likedBy : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "users"
        },
        postOwnerId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "users"
        },
        likedUserName : {
            type : String,
        }
    }, options)
    return mongoose.model("notifications", notificationSchema);
};
    
module.exports = notificationModel();