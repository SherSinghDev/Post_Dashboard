let mongoose = require('mongoose')
let { nanoid } = require('nanoid');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        // required: true,
        trim: true,
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
    },
    password: { type: String, required: true, default: '1234', trim: true },
    createdAt: { type: Date, default: Date.now },
});



module.exports = mongoose.model("Recruiter", userSchema);
