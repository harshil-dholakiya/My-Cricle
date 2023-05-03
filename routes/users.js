var express = require('express');
var router = express.Router();
const userModel = require('../models/users')
const statisticsModel = require('../models/statistics')
const moment = require('moment')
const mongoose = require('mongoose')
const multer = require('multer')
const path = require('path');
const { log } = require('handlebars/runtime');

/* GET users listing. */
router.get('/editProfile', async function (req, res, next) {
  try {
    let userData = await userModel.findOne({ "_id": req.user._id }, { 'firstName': 1, "lastName": 1, "email": 1, 'gender': 1, 'profilePath': 1 }).lean()
    console.log("userData======>", userData);
    return res.render('editProfile/editProfile', {
      title: "Edit Profile",
      userData: userData
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

router.post('/updateUser', upload.single("fileUpload"), async function (req, res) {
  try {
    req.body.profilePath = req.file?.filename
    let { firstName, lastName, email, gender, profilePath } = req.body
    await userModel.updateOne({ _id: new mongoose.Types.ObjectId(req.user._id) }, { $set: { "firstName": firstName, "lastName": lastName, "gender": gender, "profilePath": profilePath } });
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
        "postCreatedByUser": { $size: "$postCreatedByUser" },
        "savedPost": { $size: "$savedPost" }
      }
    }, {
      $sort: { 'createdOn': sortingOrder }
    })

    if (req.query.search) {
      queryArray.push({
        $match: {
          $or: [{ firstName: { $regex: `${req.query.search}`, $options: 'i' } }, { lastName: { $regex: `${req.query.search}`, $options: 'i' } }, { email: { $regex: `${req.query.search}`, $options: 'i' } }]
        }
      })
    }

    let userData = await userModel.aggregate(queryArray)
    if (req.query.sortByDate == "sortbyDate" || req.query.search) {
      return res.render('partials/userList', {
        title: "All User List",
        layout: "blank",
        userData: userData
      })
    }
    else {
      res.render('dashboard/userList', {
        title: " All User List",
        userData: userData
      })
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

router.post('/comments', async function (req, res) {
  console.log(req.body);
  res.send({ type: "success" })
})

module.exports = router;
