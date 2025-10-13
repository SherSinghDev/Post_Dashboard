let mongoose = require('mongoose')
let {nanoid} = require('nanoid');



// // Define User Schema
// const userSchema = new mongoose.Schema(
//     {
//         username: {
//             type: String,
//             required: true,
//             trim: true,
//             //   minlength: 3,
//         },
//         email: {
//             type: String,
//             required: true,
//             unique: true,
//             lowercase: true,
//             trim: true,
//             match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // basic email validation
//         },
//         city: {
//             type: String,
//             trim: true,
//         },
//         role: {
//             type: String,
//             //   enum: ["admin", "doctor", "staff", "user"], // adjust roles as per your system
//             //   default: "user",
//         },
//         password: {
//             type: String,
//             required: true,
//             minlength: 4,
//         },
//     },
//     { timestamps: true }
// );

// const User = mongoose.model("User", userSchema);


// module.exports = User

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    role: { type: String, enum: ["Team Leader", "Coordinator", "Admin"], required: true, trim: true },
    city: {
        type: String,
        trim: true,
    },
    referralCode: { type: String, unique: true, trim: true },
    referredBy: { type: String, default: null, trim: true }, // Team Leader referral code
    teamLeaderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", trim: true },

    createdAt: { type: Date, default: Date.now },
});

// Auto-generate referral code for team leaders
userSchema.pre("save", function (next) {
    if (this.role === "Team Leader" && !this.referralCode) {
        this.referralCode = "TL-" + nanoid(6).toUpperCase();
    }
    next();
});

module.exports = mongoose.model("User", userSchema);
