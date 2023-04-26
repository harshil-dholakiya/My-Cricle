const mongoose = require("mongoose");
let savedPost = function () {
    const options = {
        collection: "savedPost",
        timestamps: {
            createdAt: "createdOn",
            updatedAt: "updatedOn",
        },
    };
    const savedPostSchema = new mongoose.Schema({
        postId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "posts"
        },
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "users"
        }
    }, options)
    return mongoose.model("savedPost", savedPostSchema);
};
    
module.exports = savedPost();