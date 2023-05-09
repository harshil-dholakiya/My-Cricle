const postModel = require('../models/posts')
const express = require('express');
const router = express.Router();
const multer = require('multer')
const path = require('path')
const savedPostModel = require('../models/save-post');
const userModel = require('../models/users');
const { default: mongoose } = require('mongoose');
const { log } = require('handlebars/runtime');
const fs = require('fs');
const socket = require('../helpers/socket');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/posts');
    },
    filename: function (req, file, cb) {
        cb(null, req.user._id + '-' + Date.now()
            + path.extname(file.originalname))
    },
});

// Checking File Ext
const checkFileType = function (req, file, cb) {
    //Allowed file extensions
    const fileTypes = /jpeg|jpg|png|gif/;

    //check extension names
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

    const mimeType = fileTypes.test(file.mimetype);
    if (mimeType && extName) {
        return cb(null, true);
    } else {
        req.fileValidationError = 'error';
        return cb(new Error("Error"), false);
    }
};

// Add Post
router.post('/add-post', async function (req, res) {
    try {
        let maxSize = 2000000;
        const upload = multer({
            storage: storage,
            limits: { fileSize: maxSize },
            fileFilter: (req, file, cb) => {
                checkFileType(req, file, cb);
            },
        }).single('postImage');

        upload(req, res, async function (err) {
            try {
                if (req.fileValidationError) {
                    console.log(req.fileValidationError);
                    return res.send({ type: 'error' });
                }
                if (err) {
                    console.log(err);
                    return res.send({ type: 'tooLarge' });
                }
                else if (req.file) {
                    req.body.postPath = req.file.filename
                    let { title, description, postPath } = req.body
                    await postModel.create({
                        title, description, postPath,
                        userId: req.user._id
                    })
                    return res.send({ type: "success" })
                }
            } catch (error) {
                console.log(error);
            }
        });

    } catch (error) {
        console.log(error)
        return res.send({ type: "error" })
    }
})


//Save-Unsave Post
router.put('/savePost', async function (req, res) {
    try {
        if (req.body.title == "Save") {
            const postId = req.body.postId
            const userId = req.user._id

            // to find the user name who saved the post
            // let savedPostUserDetail = await postModel.aggregate([{
            //     $lookup: {
            //         from: 'savedPost',
            //         let: {
            //             postId: '$_id',
            //         },
            //         pipeline: [{
            //             $match: {
            //                 $expr: {
            //                     $eq: ['$$postId', '$postId']
            //                 }
            //             }
            //         },
            //         {
            //             $lookup: {
            //                 from: 'users',
            //                 let: {
            //                     userId: '$userId',
            //                 },
            //                 pipeline: [{
            //                     $match: {
            //                         $expr: {
            //                             $eq: ['$$userId', '$_id']
            //                         }
            //                     }
            //                 }],
            //                 as: "user",
            //             },
            //         },
            //         {
            //             $unwind: '$user'
            //         },
            //         {
            //             $replaceRoot: {
            //                 newRoot: "$user"
            //             }
            //         }
            //         ],
            //         as: 'savedPostuserDetail'
            //     },
            // }, {
            //     $project: {
            //         'userId' : 1,
            //         "savedPostuserDetail._id": 1,
            //         "savedPostuserDetail.firstName": 1,
            //         "savedPostuserDetail.lastName": 1
            //     }
            // }
            // ])
            let postUserId = await postModel.findOne({ _id: postId }, { _id: 0, userId: 1 })
            let likedPostUserDetail = await userModel.findOne({ _id: userId }, { firstName: 1, lastName: 1 }).lean()

            io.to(postUserId.userId.toString()).emit("newNotification", `${likedPostUserDetail.firstName} ${likedPostUserDetail.lastName} liked your post`)

            await savedPostModel.create({ postId: postId, userId: userId })
            return res.send({ type: "success" })
        }
        if (req.body.title == "Unsave") {
            const postId = req.body.postId
            await savedPostModel.deleteOne({ postId: new mongoose.Types.ObjectId(postId) })
            return res.send({ type: "Delete success" })
        }

    } catch (error) {
        console.log(error);
        return res.send({ type: "error" })
    }
})

router.put('/archivePost', async function (req, res) {
    try {
        let query = { isArchive: false }
        const postId = req.body.postId

        const userId = req.user._id
        if (req.body.archiveOrNot == "unarchive") {
            query = { isArchive: true }
        }
        await postModel.updateOne({ _id: postId, userId: userId }, { $set: { ...query } })
        return res.send({ type: "success" })

    } catch (error) {
        console.log(error);
        return res.send({ type: "error" })
    }
})

router.get('/', async function (req, res) {
    if (req.query.postId) {
        let postData = await postModel.findOne({ _id: req.query.postId }, { title: 1, description: 1, userId: 1, postPath: 1 }).lean()
        return res.send(postData)
    }
})

router.put('/postId', async function (req, res, next) {

    try {
        let maxSize = 2000000;
        const upload = multer({
            storage: storage,
            limits: { fileSize: maxSize },
            fileFilter: (req, file, cb) => {
                checkFileType(req, file, cb);
            },
        }).single('file');

        upload(req, res, async function (err) {
            let { editTitle, editDescription, postPath } = req.body
            let findPostpath = await postModel.findOne({ "_id": req.body.editPostId }, { 'postPath': 1 }) // find old postPath by postId
            let oldPostPath = findPostpath.postPath
            console.log("=========", oldPostPath);

            fs.unlink('public' + `/images/posts/${oldPostPath}`, (err => {
                if (err) console.log(err);
                else {
                    console.log("11111111");
                }
            }));
            let updateQuery = { "title": editTitle, "description": editDescription, 'postPath': postPath }
            if (req.fileValidationError) {
                return res.send({ type: 'error' });
            }
            if (err) {
                return res.send({ type: 'tooLarge' });
            }
            else if (req.file) {
                updateQuery['postPath'] = req.file?.filename
            }
            req.body.postPath = req.file?.filename

            await postModel.updateOne({ "_id": req.body.editPostId }, { $set: updateQuery })
            return res.send({ type: "success" })
        });
    } catch (error) {
        console.log(error)
        return res.send({ type: "error" })
    }
})

module.exports = router;    