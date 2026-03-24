const mongoose = require("mongoose");
const { Schema } = mongoose;

const transactionSchema = new Schema({
    receiverId: {
        type: String,
        trim: true,
    },
    receiverName: {
        type: String,
        trim: true,
    },
    senderId: {
        type: String,
        trim: true,
    },
    senderName: {
        type: String,
        trim: true,
    },
    receiverPosition: {
        type: String,
        trim: true,
    },
    senderPosition: {
        type: String,
        trim: true,
    },
    amount: {
        type: String,
        trim: true,
    },
    recieptUrl: {
        type: String,
        trim: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
