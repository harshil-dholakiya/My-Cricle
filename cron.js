const CronJob = require('cron').CronJob;
const statisticsModel = require('./models/statistics')
const userModel = require('./models/users');
const mongoose = require('mongoose')
const postModel = require('./models/posts')
const savedPostModel = require('./models/save-post');
const { create } = require('hbs');
const moment = require('moment');
const { response } = require('./app');


async function aggregateCron(userIds) {
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
    let count = 0
    for (let user of statisticsData[0].totalPostOfUser) {
        if (user.totalSavedPost > 0) {
            count += user.totalSavedPost

        }
    }
    for (const userTotalPost of statisticsData) {
        var totalPost = userTotalPost.totalPost
    }
    return { "totalPost": totalPost, "totalSavedCount": count }
}

async function userDetails() {
    let users = await userModel.find({})
    for (const userIds of users) {

        let counter = await aggregateCron(userIds._id)
        let postCount = counter.totalPost
        let savedPostCount = counter.totalSavedCount

        await statisticsModel.create({ totalCreatedPost: postCount, totalSavedPost: savedPostCount, userId: userIds._id })
    }
}
const job = new CronJob(
    '* * * * * ',
    userDetails(),
    null,
    true,
)