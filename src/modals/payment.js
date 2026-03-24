let mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    userName: String,
    email: String,
    mobile: String,

    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    amount: Number,
    membershipType: String,
    status: {
        type: String,
        enum: ["CREATED", "SUCCESS", "FAILED"],
        default: "CREATED"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Payment", paymentSchema);
