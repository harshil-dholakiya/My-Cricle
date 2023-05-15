const mongoose = require("mongoose");
let requestModel = function () {
    const options = {
        collection: "requests",
        timestamps: {
            createdAt: "createdOn",
            updatedAt: "updatedOn",
        },
    };
    const requestSchema = new mongoose.Schema({
        reqStatus: {
            type: String,
            default: "pending"
        },
        requestBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        receviedRequestUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        requestedUserName: {
            type: String,
        }
    }, options)
    return mongoose.model("requests", requestSchema);
};

module.exports = requestModel();