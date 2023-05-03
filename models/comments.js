const mongoose = require("mongoose");
let commentModel = function () {
    const options = {
        collection: "comments",
        timestamps: {
            createdAt: "createdOn",
            updatedAt: "updatedOn",
        },
    };
    const commentSchema = new mongoose.Schema({
        message: {
            type: String,
            required: true
        },
        commentBy : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "users"
        },
        postId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "posts"
        }
    }, options)
    return mongoose.model("comments", commentSchema);
};
    
module.exports = commentModel();