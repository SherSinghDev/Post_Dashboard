const mongoose = require('mongoose');
const { Schema } = mongoose;

const experienceSchema = new Schema({
    companyName: String,
    duration: String,
    designation: String
});

const userApplySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
    },
    mob: {
        type: String,
        required: true,
    },
    selfPhoto: {
        type: String,
    },
    qualification: {
        type: String,
        required: true,
    },
    isExperienced: {
        type: Boolean,
        default: false
    },
    experiences: [experienceSchema],
    idProof: {
        type: String,
    },
    age: {
        type: Number,
        required: true,
    },
    post: {
        type: String,
        required: true,
    },
    
    // Internal/Admin fields
    approveStatus: {
        type: String,
        enum: [
            "Approved",
            "Pending",
            "Cancelled",
        ],
        default: "Pending",
    },
    type: String,
    referredBy: { type: String, default: null, trim: true },
    referralCode: { type: String, trim: true },
    teamLeaderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", trim: true },
    parentUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// Export the model
module.exports = mongoose.model('RojgaarApplication', userApplySchema);
