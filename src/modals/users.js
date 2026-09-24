let mongoose = require('mongoose')
let { nanoid } = require('nanoid');



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
    name: {
        type: String,
        // required: true,
        trim: true,
    },
    userId: {
        type: String,
    },
    authority: {
        type: String,

    },
    head: {
        type: String,
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        // required: true,
    },
    dateOfBirth: {
        type: Date,
        // required: true,
    },
    validstart: {
        type: Date,
        // required: true,
    },
    validend: {
        type: Date,
        // required: true,
    },
    relationType: {
        // S/O, D/O, W/O etc.
        type: String,
        trim: true,
    },
    relationWith: {
        type: String,
        trim: true,
    },
    profession: {
        type: String,
        enum: [
            "Government Job",
            "Private Job",
            "Police",
            "Army",
            "Farmer",
            "Self Business",
            "Student",
            "Social Worker",
            "House Wife",
        ],
    },
    bloodGroup: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
        // required: true,
    },
    state: {
        type: String,
        // required: true,
    },
    district: {
        type: String,
        // required: true,
    },
    mobile: {
        type: String,
        // required: true,
    },
    role: {
        type: String,
        // required: true,
    },
    aadharNo: {
        type: String,
        // required: true,
    },
    block: {
        type: String,
    },
    village: {
        type: String,
    },
    fullAddress: {
        type: String,
        // required: true,
    },
    pinCode: {
        type: String,
        // required: true,
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
    },
    profilePicture: {
        type: String,
    },
    referrerName: {
        type: String,
    },
    idType: {
        type: String,
        enum: [
            "Aadhar Card",
            "PAN Card",
            "Voter Card",
            "Driving Licence",
            "Rashan Card",
            "Class 10th Marksheet",
        ],
    },

    idDocument: {
        type: String,
    },
    position: {
        type: String,
    },
    otherDocument: {
        type: String,
    },
    panNumber: {
        type: String,
    },
    amount: {
        type: String,
    },
    membershipType: {
        type: String,
        enum: [
            "₹1 Per Day  Donation - Annual Contribution ₹365",
            "District Level Membership - ₹2365",
            "Block Level Membership - ₹1365",
            "Centre Level Membership - ₹865"
        ],
        // required: true,
    },

    payment: {
        mode: {
            type: String,
            enum: [
                "Bank Transfer Slip",
                "Paytm",
                "Google Pay",
                "Phonepe",
                "Amazon Pay",
                "Cheque",
                "Cash",
                "Other"
            ],
            required: false,
        },
        receiptUrl: {
            type: String,
        },
    },

    type: String,
    password: { type: String, required: true, default: '1234', trim: true },
    referralCode: { type: String, trim: true },
    referredBy: { type: String, default: null, trim: true }, // Team Leader referral code
    teamLeaderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", trim: true },
    parentUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    platformWalletAmount: {
        type: Number,
        default: 0
    },
    lastLogin: { type: Date, default: Date.now },
    isSuspended: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

// Auto-generate referral code for team leaders
userSchema.pre("save", function (next) {
    if (!this.referralCode) {
        this.referralCode = "TL-" + nanoid(6).toUpperCase();
    }
    next();
});

module.exports = mongoose.model("User", userSchema);
