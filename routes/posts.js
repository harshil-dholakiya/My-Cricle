const postModel = require('../models/posts')
const express = require('express');
const router = express.Router();
const multer = require('multer')
const path = require('path')
const savedPostModel = require('../models/save-post');
const { default: mongoose } = require('mongoose');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/posts');
    },
    filename: function (req, file, cb) {
        cb(null, req.user._id + '-' + Date.now()
            + path.extname(file.originalname))
    }
});

//Checking File Ext
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

// Add Post
router.post('/add-post', upload.single("postImage"), async function (req, res) {
    try {
        req.body.postPath = req.file.filename
        let { title, description, postPath } = req.body
        await postModel.create({
            title, description, postPath,
            userId: req.user._id
        })
        return res.send({ type: "success" })
    } catch (error) {
        console.log(error)
        res.send({ type: "error" })
    }
})


//Save-Unsave Post
router.put('/savePost', async function (req, res) {
    try {
        if (req.body.title == "Save") {
            const postId = req.body.postId
            const userId = req.user._id
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
        res.send({ type: "error" })
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
        let data = await postModel.updateOne({ _id : postId, userId: userId }, { $set : { ...query } })
        return res.send({ type: "success" })

    } catch (error) {
        console.log(error);
        res.send({ type: "error" })
    }
})

router.get('/', async function (req, res) {
    if (req.query.postId) {
        let postData = await postModel.findOne({ _id: req.query.postId }, { title: 1, description: 1, userId: 1, postPath: 1 }).lean()
        res.send(postData)
    }
})

router.put('/postId',upload.single("file"),  async function (req, res, next) {
    try {
        let fileName = req.file?.filename
        await postModel.updateOne({ "_id": req.body.editPostId }, { $set: { title: req.body.editTitle, description: req.body.editDescription , postPath : fileName } })
        return res.send({ type: "success" })
    } catch (error) {
        console.log(error)
        res.send({type : "error"})
    }
})
module.exports = router;    