const express = require('express');
var cors = require('cors')
const app = express();
app.use(cors())
const port = 2000;
const post = require("./post");
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const KEY = "mZq4t6w9z$C&F)J@NcRfUjXn2r5u8x!A";
const iv = crypto.randomBytes(16);

const mongoose = require('mongoose');
const connectionpOptions = {
    dbName: "chippin",
};
const connectionUri = `mongodb://chippin:jwjIjwi5v2bckWjyI31ntKllvLSwc3wk9mWKF1AkXpwXlAvC32Gh1jeSJnK7JCdj8LwG41GvjQa9jC2S5IQs0w==@chippin.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@chippin@`;
mongoose.connect(connectionUri, connectionpOptions);
const PostModel = mongoose.model('posts', post.postsSchema);

// Get post
app.get('/api/:id', (req, res) => {
    PostModel.findOne({ stringId: req.params.id }, (err, object) => {
        if (err) {
            res.json(err);
        } else {
            if (!object || (object && object.open == 0)) {
                res.json({code: 404, msg: "Nothing found"});
            } else if (req.query.passcode != decrypt(object.passcodeIv, object.passcodeContent)) {
                res.json({code: 401, msg: "Wrong passcode"});
            } else {
                res.json(object);
            }
        }
    })
});

// Create Post
app.post('/', jsonParser, (req, res) => {
    const bodyObject = req.body;
    if (!bodyObject || !bodyObject.passcodeContent) {
        res.json({code: 400, msg: "No passcode provided!"});
    } else {
        const passcode = encrypt(bodyObject.passcodeContent);
        bodyObject.passcodeIv = passcode.iv;
        bodyObject.passcodeContent = passcode.content;
        bodyObject.stringId = generateID();
        bodyObject.open = 1;
        bodyObject.startingDate = getDate();
        bodyObject.comments = [];
        const post = new PostModel(bodyObject);
        post.save((err) => {
            if (err) {
                res.json(err);
            } else {
                res.send({code: 201, msg:"ok", id: bodyObject.stringId});
            }
        });
    }
});

// Update Post
app.post('/:id', jsonParser, (req, res) => {
    PostModel.findOne({ stringId: req.params.id }, (err, original) => {
        if (err) {
            res.json(err);
        } else {
            if (!original) {
                res.send({code: 404, msg:"ID not found.", id: req.params.id});
            } else if (req.query.passcode != decrypt(original.passcodeIv, original.passcodeContent)) {
                res.send({code: 401, msg:"Wrong passcode.", id: req.params.id});
            } else {
                const bodyObject = req.body;
                if (bodyObject) {
                    bodyObject.stringId = undefined;
                    bodyObject.passcodeIv = undefined;
                    bodyObject.passcodeContent = undefined;
                    bodyObject.startingDate = undefined;
                    bodyObject.comments = undefined;
                    bodyObject.open = 1;
                }
                PostModel.findOneAndUpdate({ stringId: req.params.id }, bodyObject, {new: true, returnOriginal: false }, (err, post) => {
                    if (err) {
                        res.json(err);
                    } else {
                        res.json(post);
                    }
                });
            }
        }
    });
});


// Check password
app.get('/checkpasscode/:id', jsonParser, (req, res) => {
    PostModel.findOne({ stringId: req.params.id }, (err, post) => {
        if (err) {
            res.json(err);
        } else {
            if (req.query.passcode != decrypt(post.passcodeIv, post.passcodeContent)) {
                res.send({code: 401, msg:"Wrong passcode.", id: req.params.id});
            } else {
                res.send({code: 200, msg:"OK", id: req.params.id});
            }
        }
    });
});


// close a post
app.delete('/:id', jsonParser, (req, res) => {
    PostModel.findOne({ stringId: req.params.id }, (err, post) => {
        if (err) {
            res.json(err);
        } else {
            if (req.query.passcode != decrypt(post.passcodeIv, post.passcodeContent)) {
                res.send({code: 401, msg:"Wrong passcode.", id: req.params.id});
            } else {
                const bodyObject = post;
                bodyObject.stringId = undefined;
                bodyObject.passcodeIv = undefined;
                bodyObject.passcodeContent = undefined;
                bodyObject.startingDate = undefined;
                bodyObject.open = 0;
                PostModel.findOneAndUpdate({ stringId: req.params.id }, bodyObject, {new: false, returnOriginal: false }, (err) => {
                    if (err) {
                        res.json(err);
                    } else {
                       res.json({code: 202, msg:"Deleted.", id: req.params.id});
                    }
                });
            }
        }
    });
});


// Add Comment
app.get('/comment/:id', jsonParser, (req, res) => {
    PostModel.findOne({ stringId: req.params.id }, (err, post) => {
        if (err) {
            res.json(err);
        } else {
            const comment = req.query.comment;
            if (comment.length > 100) {
                res.json({code: 400, message: "Comment is too long.", id: req.params.id});
            } else {
                post.comments.push(comment)
                const change = {"comments": post.comments};
                PostModel.findOneAndUpdate({ stringId: req.params.id }, change, {new: true, returnOriginal: false }, (err, post) => {
                    if (err) {
                        res.json(err);
                    } else {
                        res.json(post);
                    }
                });
            }
        }
    });
});

/* 
    Generates a 6 character Alpha-Numeric ID
*/
function generateID() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
}

const encrypt = (text) => {
    const cipher = crypto.createCipheriv(algorithm, KEY, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};

const decrypt = (hashIv, hashContent) => {
    const decipher = crypto.createDecipheriv(algorithm, KEY, Buffer.from(hashIv, 'hex'));
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hashContent, 'hex')), decipher.final()]);
    return decrpyted.toString();
};


const getDate = () => {
    const date_ob = new Date();
    const date = ("0" + date_ob.getDate()).slice(-2);
    const month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    const year = date_ob.getFullYear();
    return year + "-" + month + "-" + date;
};


app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
})