let mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        pinCode: {
            type: String,
            required: true,
            match: /^[0-9]{6}$/, // Indian PIN code validation
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        mobile: {
            type: String,
            required: true,
            match: /^[6-9]\d{9}$/, // Indian mobile validation
        },
        jobType: {
            type: String,
            required: true,

        },
        approveStatus: {
            type: String,
            // required: true,
            default: "Unverified"
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
