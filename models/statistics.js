const mongoose = require("mongoose");
let statisticsModel = function () {
    const options = {
        collection: "statistics",
        timestamps: {
            createdAt: "createdOn",
            updatedAt: "updatedOn",
        },
    };
    const statisticsSchema = new mongoose.Schema({
        userId : {
            type : mongoose.Types.ObjectId
        },
        totalSavedPost: {
            type: Number
        },
        totalCreatedPost: {
            type: Number
        }
    }, options)

    return mongoose.model("statistics", statisticsSchema);
};

module.exports = statisticsModel();