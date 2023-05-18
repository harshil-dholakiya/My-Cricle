var express = require('express');
var router = express.Router();
const userModel = require('../models/users')
const statisticsModel = require('../models/statistics')
const commentModel = require('../models/comments')
const notificationModel = require('../models/notifications')
const moment = require('moment')
const mongoose = require('mongoose')
const multer = require('multer')
const path = require('path');
const { log } = require('handlebars/runtime');
const requestModel = require('../models/requests');
const chatModel = require('../models/chats');
const { title } = require('process');

/* GET users listing. */
router.get('/editProfile', async function (req, res, next) {
  try {
    let userData = await userModel.findOne({ "_id": req.user._id }, { 'firstName': 1, "lastName": 1, "email": 1, 'gender': 1, 'profilePath': 1, "accountType": 1 }).lean()

    let notificationData = await notificationModel.find({ postOwnerId: req.user._id, isSeen: false }).sort({ createdOn: -1 }).lean()
    let notificationCount = notificationData.length

    io.to(req.user._id.toString()).emit("notificationCount", JSON.stringify(notificationData))

    return res.render('editProfile/editProfile', {
      title: "Edit Profile",
      userData: userData,
      notificationData: notificationData,
      notificationCount: notificationCount
    });

  } catch (error) {
    console.log(error)
    res.send({ type: "error" })
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/users');
  },
  filename: function (req, file, cb) {
    cb(null, req.user._id
      + path.extname(file.originalname))
  }
});

const checkFileType = function (file, cb) {
  //Allowed file extensions
  const fileTypes = /jpeg|jpg|png|gif/;

  //check extension names
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb("Error: You can Only Upload Images!!");
  }
};

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

router.post('/updateUser', upload.single("userProfile"), async function (req, res) {
  try {
    req.body.profilePath = req.file?.filename
    let { firstName, lastName, gender, profilePath, account } = req.body
    await userModel.updateOne({ _id: new mongoose.Types.ObjectId(req.user._id) }, { $set: { "firstName": firstName, "lastName": lastName, "gender": gender, "profilePath": profilePath, 'accountType': account } });
    return res.send({ type: "success" })
  } catch (error) {
    console.log(error);
    res.send({ type: "Please upload a valid image" })
  }
})

router.get('/userList', async function (req, res) {
  try {
    var sortingOrder = 1
    if (req.query.sortByDate == "sortbyDate" && req.query.sortOrder) {
      sortingOrder = Number(req.query.sortOrder)
    }

    let userscountDocuments = []
    userscountDocuments.push({
      $lookup: {
        from: 'posts',
        localField: '_id',
        foreignField: 'userId',
        as: 'postCreatedByUser'
      }
    },
      {
        $lookup: {
          from: 'savedPost',
          localField: '_id',
          foreignField: 'userId',
          as: "savedPost"
        }
      },
      {
        $lookup: {
          from: "requests",
          let: { userId: "$_id" },
          pipeline: [{
            $match: {
              $expr: { $and: [{ $eq: ['$$userId', '$receviedRequestUser'] }, { $eq: ['$requestBy', new mongoose.Types.ObjectId(req.user._id)] }] }
            }
          }],
          as: 'requestOfLoginUser'
        }
      },
      { $unwind: { path: "$requestOfLoginUser", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          "firstName": 1,
          "lastName": 1,
          "profilePath": 1,
          "createdOn": 1,
          "email": 1,
          "accountType": 1,
          "postCreatedByUser": { $size: "$postCreatedByUser" },
          "savedPost": { $size: "$savedPost" },
          'requestOfLoginUser.reqStatus': 1,
        }
      },
      {
        $sort: { 'createdOn': sortingOrder }
      })

    if (req.query.search) {
      userscountDocuments.push({
        $match: {
          $or: [{ firstName: { $regex: `${req.query.search}`, $options: 'i' } }, { lastName: { $regex: `${req.query.search}`, $options: 'i' } }, { email: { $regex: `${req.query.search}`, $options: 'i' } }]
        }
      })
    }

    let userCount = await userModel.aggregate(userscountDocuments)
    usersPagination = userCount.length

    if (req.query.pageValue == undefined) {
      req.query.pageValue = 1
    }

    let limit = 3
    const totalRecords = usersPagination;
    const totalPages = Math.ceil(totalRecords / limit);
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
    let skip = ((Number(req.query.pageValue) - 1) * limit)

    // User Listing Query 
    let queryArray = []
    // queryArray.push({
    //   $lookup: {
    //     from: 'posts',
    //     localField: '_id',
    //     foreignField: 'userId',
    //     as: 'postCreatedByUser'
    //   }
    // },
    //   {
    //     $lookup: {
    //       from: 'savedPost',
    //       localField: '_id',
    //       foreignField: 'userId',
    //       as: "savedPost"

    //     }
    //   }, {
    //   $project: {
    //     "firstName": 1,
    //     "lastName": 1,
    //     "profilePath": 1,
    //     "createdOn": 1,
    //     "email": 1,
    //     "accountType": 1,
    //     "postCreatedByUser": { $size: "$postCreatedByUser" },
    //     "savedPost": { $size: "$savedPost" }
    //   }
    // }, {
    //   $sort: { 'createdOn': sortingOrder }
    // }, {
    //   $skip: skip,
    // },
    //   {
    //     $limit: limit
    //   })
    queryArray.push({
      $lookup: {
        from: 'posts',
        localField: '_id',
        foreignField: 'userId',
        as: 'postCreatedByUser'
      }
    },
      {
        $lookup: {
          from: 'savedPost',
          localField: '_id',
          foreignField: 'userId',
          as: "savedPost"
        }
      },
      {
        $lookup: {
          from: "requests",
          let: { userId: "$_id" },
          pipeline: [{
            $match: {
              $expr: { $and: [{ $eq: ['$$userId', '$receviedRequestUser'] }, { $eq: ['$requestBy', new mongoose.Types.ObjectId(req.user._id)] }, { $ne: ["$reqStatus", 'rejected'] }] }
            }
          }],
          as: 'requestOfLoginUser'
        }
      },
      { $unwind: { path: "$requestOfLoginUser", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          "firstName": 1,
          "lastName": 1,
          "profilePath": 1,
          "createdOn": 1,
          "email": 1,
          "accountType": 1,
          "postCreatedByUser": { $size: "$postCreatedByUser" },
          "savedPost": { $size: "$savedPost" },
          'requestOfLoginUser.reqStatus': 1,
        }
      },
      {
        $sort: { 'createdOn': sortingOrder }
      },
      {
        $skip: skip,
      },
      {
        $limit: limit
      })

    if (req.query.search) {
      queryArray.push({
        $match: {
          $or: [{ firstName: { $regex: `${req.query.search}`, $options: 'i' } }, { lastName: { $regex: `${req.query.search}`, $options: 'i' } }, { email: { $regex: `${req.query.search}`, $options: 'i' } }]
        }
      })
    }

    let userData = await userModel.aggregate(queryArray)
    if (req.xhr) {
      return res.render('partials/userList', {
        title: "All User List",
        layout: "blank",
        pages: pages,
        userData: userData
      })
    }
    else {
      try {
        let notificationData = await notificationModel.find({ postOwnerId: req.user._id, isSeen: false }).sort({ createdOn: -1 }).lean()
        let notificationCount = notificationData.length

        io.to(req.user._id.toString()).emit("notificationCount", JSON.stringify(notificationData))
        res.render('dashboard/userList', {
          title: "All User List",
          userData: userData,
          notificationCount: notificationCount,
          pages: pages,
          notificationData: notificationData
        })
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error)
  }
})

router.get('/report', async function (req, res) {
  let savedPostArray = []
  let createPostArray = []
  let createOnArray = []
  let totalPostsavedByUser = []

  let statisticData = await statisticsModel.find({ userId: req.user._id }).lean()

  for (let i = 0; i < statisticData.length; i++) {
    totalPostsavedByUser.push(statisticData[i].totalsavedByuser)
    createOnArray.push(moment(statisticData[i].createdOn).format('YYYY_MM_DD_hh_mm'))
    savedPostArray.push(statisticData[i].totalSavedPost)
    createPostArray.push(statisticData[i].totalCreatedPost)
  }

  res.render('dashboard/report', {
    title: "Report",
    totalPostsavedByUser: totalPostsavedByUser,
    savedPostArray: savedPostArray,
    createPostArray: createPostArray,
    createOnArray: createOnArray
  })
})

// Get comment with who added comments on particular post
router.get('/comments/:postId', async function (req, res) {
  try {
    let commentsData = await commentModel.aggregate([
      {
        $match: {
          'postId': new mongoose.Types.ObjectId(req.params.postId)
        }
      },
      {
        $lookup: {
          from: 'users',
          let: {
            userId: '$commentBy'
          },
          pipeline: [{
            $match: {
              $expr: {
                $eq: ['$$userId', '$_id']
              }
            }
          },
          ],
          as: 'commentByUser',
        },
      },
      {
        $unwind: '$commentByUser'
      }
    ])

    return res.render('partials/getComments', {
      commentsData: commentsData
    })
  } catch (error) {
    console.log(error);
    return res.send({ type: "error" })
  }
})

// Add comment
router.post('/comments/:postId', async function (req, res) {
  try {
    let { commentMessage } = req.body
    await commentModel.create({ message: commentMessage, postId: req.params.postId, commentBy: req.user._id })
    return res.send({ type: "success" })
  } catch (error) {
    console.log(error);
    return res.send({ type: "error" })
  }
})

// Delete Comment 
router.delete('/delete-comment/:postId', async function (req, res) {
  try {
    await commentModel.deleteOne({ postId: new mongoose.Types.ObjectId(req.params.postId), commentBy: new mongoose.Types.ObjectId(req.user._id) })
    return res.send({ type: "success" })
  } catch (error) {
    console.log(error);
    return res.send({ type: "error" })
  }
})

router.post('/request/:userId', async function (req, res) {
  try {
    let findUserAccountType = await userModel.findById({ _id: req.params.userId }, { firstName: 1, lastName: 1, accountType: 1, profilePath: 1 })
    let fullName = `${req.user.firstName}${req.user.lastName}`
    let userAccountType = findUserAccountType.accountType
    let requestQueryObject = { requestedUserAccountType: userAccountType, profilePhotoOfRequestedUser: findUserAccountType.profilePath, requestBy: req.user._id, receviedRequestUser: req.params.userId, requestedUserName: fullName, reqStatus: "pending" }
    let responseSendObject = {
      accountType: 'private'
    }
    if (userAccountType == "public") {
      requestQueryObject.reqStatus = "accepted"
      responseSendObject.accountType = userAccountType
    }
    let isAlreadyRequested = await requestModel.find({ requestBy: req.user._id, receviedRequestUser: req.params.userId, reqStatus: { $in: ['accepted', 'pending'] } })
    console.log("isAlreadyRequested", isAlreadyRequested);
    if (!isAlreadyRequested.length) {
      let requestSent = await requestModel.create(requestQueryObject)
      io.to(req.params.userId.toString()).emit("requestNotification", JSON.stringify(requestSent))
      return res.send(responseSendObject)
    }
  } catch (error) {
    console.log(error);
  }
})

router.get('/get-requests/:userId', async function (req, res) {
  try {
    let allRequest = await requestModel.aggregate([
      {
        $match: {
          $and: [{ 'receviedRequestUser': new mongoose.Types.ObjectId(req.user._id) }, { "reqStatus": { $in: ['accepted', 'pending'] } }],
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'requestBy',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $sort: { 'createdOn': -1 }
      },
      {
        $limit: 1
      },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
    ])

    res.render('partials/getRequests', {
      requestData: allRequest
    })
  } catch (error) {
    console.log(error);
    return res.send({ type: "error" })
  }
})

router.put('/isaccepted-request/:userId/:isAccepted', async function (req, res) {
  try {
    var isRequestAccepted = await requestModel.updateMany({ requestBy: new mongoose.Types.ObjectId(req.params.userId), receviedRequestUser: new mongoose.Types.ObjectId(req.user._id) }, { $set: { reqStatus: req.params.isAccepted } })

    let userIdToEmit = new mongoose.Types.ObjectId(req.params.userId) + new mongoose.Types.ObjectId(req.user._id)
    let receivedRequestUserName = await userModel.findOne({ _id: new mongoose.Types.ObjectId(req.user._id) }, { firstName: 1, lastName: 1 })
    let fullName = `${receivedRequestUserName.firstName} ${receivedRequestUserName.lastName}`

    isRequestAccepted.userName = fullName
    isRequestAccepted.userIdToEmit = userIdToEmit
    isRequestAccepted.isAccepted = req.params.isAccepted
    isRequestAccepted.requestBy = req.params.userId

    io.to(req.params.userId.toString()).emit("isRequestAccepted", JSON.stringify(isRequestAccepted))

    res.send({ type: "success" })
  } catch (error) {
    console.log(error);
    return res.send({ type: "error" })
  }
})

router.get('/chat-model', async function (req, res) {
  try {
    let allUsers = await userModel.find({ _id: { $ne: req.user._id } }).lean()
    allUsers[0]["loginUserId"] = req.user._id
    return res.send(allUsers)

  } catch (error) {
    console.log(error);
  }
})

router.get('/chat/:userId', async function (req, res) {
  try {
    let chatMessages = await chatModel.aggregate([{
      $match: {
        $or: [{
          $and: [{
            'senderId': new mongoose.Types.ObjectId(req.user._id)
          }, {
            'receiverId': new mongoose.Types.ObjectId(req.params.userId)
          }]
        },
        {
          $and: [{
            'senderId': new mongoose.Types.ObjectId(req.params.userId)
          }, {
            'receiverId': new mongoose.Types.ObjectId(req.user._id)
          }]
        }]
      }
    }
    ])
    return res.send(chatMessages)

  } catch (error) {
    console.log(error);
  }
})

router.post('/userChat/:userId', async function (req, res) {
  let createMessage = await chatModel.create({ chatMessage: req.body.chatMessage, receiverId: req.params.userId, senderId: req.user._id })

  io.to(req.params.userId.toString()).emit("newMessage", createMessage)
  return res.send(createMessage)
})

module.exports = router;
