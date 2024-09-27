const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    pinNumber: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    mobilenumber: {
        type: String,
        required: true,
    },
    branch: {
        type: String,
        required: true,
    },
    regulationNumber: {
        type: String,
        required: true,
    },
    file: {
        type: String, // or another appropriate type
    },
    role:{
        type: String,
        default: "student" // default role is student for new users
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
