const express = require('express');
const app = express();
const port = 3000;
const post = require("./post");

const mongoose = require('mongoose');
const connectionpOptions = {
    dbName: "chippin",
};
const connectionUri = `mongodb://chippin:jwjIjwi5v2bckWjyI31ntKllvLSwc3wk9mWKF1AkXpwXlAvC32Gh1jeSJnK7JCdj8LwG41GvjQa9jC2S5IQs0w==@chippin.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@chippin@`;
mongoose.connect(connectionUri, connectionpOptions);
const PostModel = mongoose.model('posts', post.postsSchema);


app.get('/:id', (req, res) => {
    PostModel.find({ stringId: req.params.id }, (err, objects) => {
        if (err) {
            res.send({code: 404, msg: "An error happened"});
        } else {
            res.send(objects);
        }
    })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})