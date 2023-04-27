const express = require('express');
const router = express.Router();
const userModel = require('../models/users')
const postModel = require('../models/posts')
const savedPostModel = require('../models/save-post')
const md5 = require('md5');
const passport = require('passport');
const mongoose = require('mongoose')


router.get('/sign-in', function (req, res, next) {
  try {
    if (req.isAuthenticated()) {
      res.redirect('/')
    } else {
      return res.render('index/sign-in',
        {
          title: 'Sign in',
          layout: 'auth'
        });
    }
  } catch (error) {
    res.send({ type: "error", message: "Hii" })
  }
});

//Login Page
router.post('/sign-in', async function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err)
    }
    if (!user) {
      req.flash('error', 'Please provide valid login details')
      return res.redirect('/sign-in');
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect('/');
    });
  })(req, res, next);
});


router.get('/sign-up', function (req, res, next) {
  try {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    return res.render('index/sign-up',
      {
        title: 'Sign Up',
        layout: 'auth'
      });
  } catch (error) {
    res.send({ type: "error" })
  }
});

// Dashboard View
router.get('/', async function (req, res) {
  try {
    if (req.isAuthenticated()) {
      const loginUserData = await userModel.findOne({ "_id": req.user._id }, { 'email': 1, "firstName": 1, "lastName": 1, "profilePath": 1 }).lean()
      res.locals.userDetails = loginUserData
    }

    // =================Count Documents Query For Pagination================
    let countDocuments = [];
    let countpostPipeline = [{
      $match: {
        $and: [{ $expr: { $eq: ['$$userId', '$userId'] } }, { 'isArchive': false }]
      }
    }];
    let countuserFilterObj = {};
    if (req.query.type == "mine") {
      countuserFilterObj = {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user._id)
        }
      };
      countDocuments.push(countuserFilterObj);
    }
    if (req.query.type == "others") {
      countuserFilterObj = {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(req.user._id) }
        }
      }
      countDocuments.push(countuserFilterObj);
    }

    if (req.query.sortField && req.query.sortOrder) {
      console.log("req.query.sortOrder", req.query.sortOrder);
      let sortStage = {
        "$sort": {
        }
      }
      sortStage["$sort"][req.query.sortField] = Number(req.query.sortOrder);
      countpostPipeline.push(sortStage);
    }

    if (req.query.savedPost == "savedPost") {
      let savedPostIds = await savedPostModel.distinct("postId", { userId: req.user._id });
      let savedPostUserIds = await postModel.distinct("userId", { _id: { $in: savedPostIds } });

      countDocuments.push({
        $match: {
          _id: {
            $in: savedPostUserIds
          }
        }
      });

      countDocuments.push({
        $lookup: {
          from: "posts",
          let: {
            userId: "$_id"
          },
          pipeline: [{
            $match: {
              $and: [{ $expr: { $eq: ['$$userId', '$userId'] } }, { 'isArchive': false }, { _id: { $in: savedPostIds } }]
            }
          }],
          as: 'postdata'
        }
      }, {
        $unwind: "$postdata"
      });
    } else {
      countDocuments.push({
        $lookup: {
          from: "posts",
          let: {
            userId: "$_id"
          },
          pipeline: countpostPipeline,
          as: 'postdata'
        }
      }, {
        $unwind: "$postdata"
      });
    }

    if (req.query.search) {
      countDocuments.push({
        $match: {
          $or: [{
            "postdata.title": {
              $regex: req.query.search,
              $options: 'i'
            }
          }, {
            "postdata.description": {
              $regex: req.query.search,
              $options: 'i'
            }
          }]
        }
      });
    }

    if (req.query.pageValue == undefined) {
      req.query.pageValue = 1
    }

    let data = await userModel.aggregate(countDocuments)
    var page = data.length

    // =================== Get Post Query ========================
    let aggregateQuery = [];
    let postPipeline = [{
      $match: {
        $and: [{ $expr: { $eq: ['$$userId', '$userId'] } }, { 'isArchive': false }]
      }
    }];
    let userFilterObj = {};
    if (req.query.type == "mine") {
      userFilterObj = {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user._id)
        }
      };
      aggregateQuery.push(userFilterObj);
    }
    if (req.query.type == "others") {
      userFilterObj = {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(req.user._id) }
        }
      }
      aggregateQuery.push(userFilterObj);
    }

    if (req.query.sortField && req.query.sortOrder) {
      let sortStage = {
        "$sort": {
        }
      }
      sortStage["$sort"][req.query.sortField] = Number(req.query.sortOrder);
      postPipeline.push(sortStage);
    }

    if (req.query.savedPost == "savedPost") {
      let savedPostIds = await savedPostModel.distinct("postId", { userId: req.user._id });
      let savedPostUserIds = await postModel.distinct("userId", { _id: { $in: savedPostIds } });

      aggregateQuery.push({
        $match: {
          _id: {
            $in: savedPostUserIds
          }
        }
      });

      aggregateQuery.push({
        $lookup: {
          from: "posts",
          let: {
            userId: "$_id"
          },
          pipeline: [{
            $match: {
              $and: [{ $expr: { $eq: ['$$userId', '$userId'] } }, { 'isArchive': false }, { _id: { $in: savedPostIds } }]
            }
          }],
          as: 'postdata'
        }
      }, {
        $unwind: "$postdata"
      });
    } else {
      aggregateQuery.push({
        $lookup: {
          from: "posts",
          let: {
            userId: "$_id"
          },
          pipeline: postPipeline,
          as: 'postdata'
        }
      }, {
        $unwind: "$postdata"
      });
    }

    if (req.query.search) {
      aggregateQuery.push({
        $match: {
          $or: [{
            "postdata.title": {
              $regex: req.query.search,
              $options: 'i'
            }
          }, {
            "postdata.description": {
              $regex: req.query.search,
              $options: 'i'
            }
          }]
        }
      });
    }

    if (req.query.pageValue == undefined) {
      req.query.pageValue = 1
    }

    let limit = 5
    const totalRecords = page;
    const totalPages = Math.ceil(totalRecords / limit);
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
    let skip = ((Number(req.query.pageValue) - 1) * limit)

    aggregateQuery.push({
      $group: {
        _id: "$_id",
        "postdata": {
          "$push": "$postdata",
        },
        "firstName": { "$first": "$firstName" },
        "lastName": { "$first": "$lastName" },
        "profilePath": { "$first": "$profilePath" }
      }
    },
      {
        $project: {
          'firstName': 1,
          'lastName': 1,
          'profilePath': 1,
          'postdata.title': 1,
          'postdata._id': 1,
          'postdata.description': 1,
          'postdata.postPath': 1,
          'postdata.createdOn': 1,
          'postOrder': {
            $size: '$postdata'
          }
        }
      },
      {
        $sort: {
          'postOrder': -1
        }
      },
      {
        $unwind: "$postdata"
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $group: {
          _id: "$_id",
          "postdata": {
            "$push": "$postdata",

          },
          "firstName": { "$first": "$firstName" },
          "lastName": { "$first": "$lastName" },
          "profilePath": { "$first": "$profilePath" }
        }
      },
      {
        $project: {
          'firstName': 1,
          'lastName': 1,
          'profilePath': 1,
          'postdata.title': 1,
          'postdata._id': 1,
          'postdata.description': 1,
          'postdata.postPath': 1,
          'postdata.createdOn': 1,
          'postOrder': {
            $size: '$postdata'
          }
        }
      },
      {
        $sort:
        {
          'postOrder': -1
        }
      }
    );

    let savedPost = await savedPostModel.distinct('postId', { "userId": { $eq: req.user?._id } }, { 'postId': 1 })

    // Final Query
    let postData = await userModel.aggregate(aggregateQuery);

    if (req.xhr) {
      return res.render('partials/posts', {
        title: 'My Cricle',
        postData: postData,
        savedPost: savedPost,
        pages: pages
      })
    }
    else {
      return res.render('dashboard/index', {
        title: 'My Cricle',
        postData: postData,
        savedPost: savedPost,
        pages: pages
      })
    }
  } catch (error) {
    console.log(error);
    res.send({ type: "error", message: "from Get" })
  }
})

// sign-up Data post
router.post('/sign-up-data', async function (req, res, next) {
  try {
    const { firstName, lastName, email, gender, password } = req.body
    await userModel.create({
      firstName,
      lastName,
      email,
      gender,
      password: md5(password),
    })
    return res.redirect("/sign-in")

  } catch (error) {
    res.send({ type: "error" })
  }
});

router.get('/check-email', async function (req, res, next) {
  try {
    let query = { 'email': req.query.email };
    if (req.user && req.user._id) {
      query["_id"] = {
        $ne: req.user._id
      }
    }
    let isEmailExists = await userModel.countDocuments(query)
    if (isEmailExists) {
      return res.send(false)
    }
    res.send(true);
  } catch (error) {
    res.send({ type: "error" })
  }
});

// sign-in Page get route
router.get('/sign-in', function (req, res, next) {
  try {
    if (req.isAuthenticated()) {
      res.redirect('/')
    } else {
      return res.render('index/sign-in',
        {
          title: 'Sign in',
          layout: 'auth'
        });
    }
  } catch (error) {
    res.send({ type: "error", message: "Hii" })
  }
});

//Login Page
router.post('/sign-in', async function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err)
    }
    if (!user) {
      req.flash('error', 'Please provide valid login details')
      return res.redirect('/sign-in');
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect('/');
    });
  })(req, res, next);
});

router.get('/logout', function (req, res, next) {
  try {
    req.logout();
    req.session = null;
    return res.redirect('/');
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
