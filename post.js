const mongoose = require('mongoose');

const postsSchema = new mongoose.Schema({
    stringId: String,
    name: String,
    email: String,
    description: String,
    price: Number,
    numberOfPeople: Number,
    startingDate: String,
    passcode: String,
    bankInfo: {
        email: String,
        phone: Number
    },
    image: String,
    url: String
});
module.exports = { postsSchema };