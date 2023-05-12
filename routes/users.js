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
      }, {
      $project: {
        "firstName": 1,
        "lastName": 1,
        "profilePath": 1,
        "createdOn": 1,
        "email": 1,
        "postCreatedByUser": { $size: "$postCreatedByUser" },
        "savedPost": { $size: "$savedPost" }
      }
    }, {
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
      }, {
      $project: {
        "firstName": 1,
        "lastName": 1,
        "profilePath": 1,
        "createdOn": 1,
        "email": 1,
        "accountType": 1,
        "postCreatedByUser": { $size: "$postCreatedByUser" },
        "savedPost": { $size: "$savedPost" }
      }
    }, {
      $sort: { 'createdOn': sortingOrder }
    }, {
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

    // if (req.query.sortByDate == "sortbyDate" || req.query.search) {
    //   return res.render('partials/userList', {
    //     title: "All User List",
    //     layout: "blank",
    //     userData: userData
    //   })
    // }

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

module.exports = router;
