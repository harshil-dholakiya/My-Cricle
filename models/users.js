const mongoose = require("mongoose");
let usersModel = function () {
    const options = {
        collection: "users",
        timestamps: {
            createdAt: "createdOn",
            updatedAt: "updatedOn",
        },
    };
    const UsersSchema = new mongoose.Schema({
        email: {
            type: String,
            required: true
        },
        verifyToken : {
            type : String,
        },
        isVerified : {
            type : Boolean,
            default : false
        },
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        profilePath : {
            type : String,
        },
        gender: {
            type: String,
            enum: ["female", "male"],
            required: true
        },
        password: {
            type: String,
            required: true
        }
    }, options)

    return mongoose.model("users", UsersSchema);
};
    
module.exports = usersModel();