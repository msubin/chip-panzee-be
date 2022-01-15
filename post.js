const mongoose = require('mongoose');

const postsSchema = new mongoose.Schema({
    stringId: String,
    name: String,
    email: String,
    description: String,
    price: Number,
    numberOfPeople: Number,
    chippedInMembers: [
        {
            name:String,
            amount: Number,
            email: String
        }
    ],
    startingDate: String,
    passcode: String,
    bankInfo: {
        name: String,
        email: String,
        phone: Number
    },
    image: String
});
module.exports = { postsSchema };