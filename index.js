const express = require('express');
const app = express();
const port = 3000;
const post = require("./post");
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const mongoose = require('mongoose');
const connectionpOptions = {
    dbName: "chippin",
};
const connectionUri = `mongodb://chippin:jwjIjwi5v2bckWjyI31ntKllvLSwc3wk9mWKF1AkXpwXlAvC32Gh1jeSJnK7JCdj8LwG41GvjQa9jC2S5IQs0w==@chippin.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@chippin@`;
mongoose.connect(connectionUri, connectionpOptions);
const PostModel = mongoose.model('posts', post.postsSchema);

// Get post
app.get('/:id', (req, res) => {
    PostModel.findOne({ stringId: req.params.id }, (err, object) => {
        if (err) {
            res.json(err);
        } else {
            res.json(object);
        }
    })
})

// Update Post
app.post('/', jsonParser, (req, res) => {
    console.log(req.body);
    // TODO: implement create with 
    const post = new PostModel(re.body);
    post.save((err) => {
        if (err) {
            res.json(err);
        } else {
            res.send({code: 201, msg:"ok", id: ""});
        }
    });
})

// Update Post
app.post('/:id', jsonParser, (req, res) => {
    // TODO: Check pass code here
    const filter = { stringId: req.params.id };
    PostModel.findOneAndUpdate(filter, req.body, (err, post) => {
        PostModel.findOne({ stringId: post.stringId }, (err, post) => {
            if (err) {
                res.json(err);
            } else {
                res.json(post);
            }
        })
    });
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
