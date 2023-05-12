const CronJob = require('cron').CronJob;
const statisticsModel = require('./models/statistics')
const userModel = require('./models/users');
const mongoose = require('mongoose')
const postModel = require('./models/posts')
const savedPostModel = require('./models/save-post');
const { create } = require('hbs');
const moment = require('moment');

async function aggregateCron(userIds) {
    /**function for login user
         * @param {ObjectId} userId  takes an userId 
         * @return {Object} return totalSavedPost, totalPostOfUser, how much post he saved 
         */
    var statisticsData = await userModel.aggregate([
        {
            $match: {
                _id: userIds
            }
        },
        {
            $lookup: {
                from: 'posts',
                let: {
                    userId: '$_id'
                },
                pipeline: [{
                    $match: {
                        $expr: {
                            $eq: ['$$userId', '$userId']
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'savedPost',
                        let: {
                            postId: '$_id'
                        },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: ['$$postId', '$postId']
                                }
                            }
                        }],
                        as: 'totalSavedPost',
                    }
                }, {
                    $addFields: {
                        'totalSavedPost': { $size: '$totalSavedPost' },
                    }
                }
                ],
                as: 'totalPostOfUser',
            },
        },
        {
            $addFields: {
                'totalPost': { $size: '$totalPostOfUser' }
            }
        }
    ])

    var userSavedPost = await userModel.aggregate([
        {
            $match: {
                _id: userIds
            }
        },
        {
            $lookup: {
                from: 'savedPost',
                localField: '_id',
                foreignField: 'userId',
                as: 'totalSavedPost'
            }
        },
        {
            $project: {
                'totalSavedPost': { $size: '$totalSavedPost' }
            }
        }
    ])

    for (const users of userSavedPost) {
        var post = users.totalSavedPost
    }
    
    let count = 0
    for (let user of statisticsData[0].totalPostOfUser) {
        if (user.totalSavedPost > 0) {
            count += user.totalSavedPost
        }
    }
    for (const userTotalPost of statisticsData) {
        var totalPost = userTotalPost.totalPost
    }
    return { "totalPost": totalPost, "totalSavedCount": count, "savedPostByUser": post }
}

async function userDetails() {
    let users = await userModel.find({})
    for (const userIds of users) {
        let counter = await aggregateCron(userIds._id)
        let postCount = counter.totalPost
        let savedPostCount = counter.totalSavedCount
        let totalsavedByuser = counter.savedPostByUser
        await statisticsModel.create({ totalCreatedPost: postCount, totalSavedPost: savedPostCount, totalsavedByuser: totalsavedByuser, userId: userIds._id })
    }
}

const job = new CronJob(
    // at every Midnight
    '0 * * * *',
    function () {
        userDetails()
    },
    null,
    true,
)