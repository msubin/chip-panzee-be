const mongoose = require('mongoose');

const postsSchema = new mongoose.Schema({
    stringId: String,
    name: String,
    email: String,
    description: String,
    price: Number,
    numberOfPeople: Number,
    startingDate: String,
    passcodeIv: String,
    passcodeContent: String,
    bankEmail: String,
    bankPhone: String,
    image: String,
    url: String,
    open: Number,
    comments: [String]
});
module.exports = { postsSchema };