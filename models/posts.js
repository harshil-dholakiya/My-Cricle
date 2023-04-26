const mongoose = require("mongoose");
let postModel = function () {
    const options = {
        collection: "posts",
        timestamps: {
            createdAt: "createdOn",
            updatedAt: "updatedOn",
        },
    };
    const PostSchema = new mongoose.Schema({
        title: {
            type: String,
            maxLength: 30,
            required: true
        },
        description: {
            type: String,
            maxLength: 300,
            required: true
        },
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "users"
        },
        postPath : {
            type  : String,
        },
        isArchive : {
            type: Boolean,
            default: false,
        }
    }, options)
    return mongoose.model("posts", PostSchema);
};
    
module.exports = postModel();