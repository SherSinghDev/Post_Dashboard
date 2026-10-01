const mongoose = require('mongoose');
const { Schema } = mongoose;

const payoutRequestSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    month: {
        type: String, // e.g. "2026-01" or "January 2026"
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
        default: 'Pending'
    },
    paymentReceipt: {
        type: String, // Admin can upload receipt upon completion
        default: null
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('PayoutRequest', payoutRequestSchema);
