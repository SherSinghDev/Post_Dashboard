let mongoose = require('mongoose')



// Define User Schema
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            //   minlength: 3,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // basic email validation
        },
        city: {
            type: String,
            trim: true,
        },
        role: {
            type: String,
            //   enum: ["admin", "doctor", "staff", "user"], // adjust roles as per your system
            //   default: "user",
        },
        password: {
            type: String,
            required: true,
            minlength: 4,
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);


module.exports = User