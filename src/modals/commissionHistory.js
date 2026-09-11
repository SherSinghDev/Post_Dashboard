const mongoose = require('mongoose');
const { Schema } = mongoose;

const commissionHistorySchema = new Schema({
    recipientId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    recipientUserId: {
        type: String,
        trim: true
    },
    recipientName: {
        type: String,
        trim: true
    },
    fromUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fromUserDisplayId: {
        type: String,
        trim: true
    },
    fromUserName: {
        type: String,
        trim: true
    },
    fromUserPosition: {
        type: String,
        trim: true
    },
    transactionId: {
        type: Schema.Types.ObjectId,
        ref: 'StockTransaction',
        index: true
    },
    level: {
        type: Number, // 1 to 5
        required: true
    },
    stockCount: {
        type: Number,
        required: true
    },
    ratePerStock: {
        type: Number,
        required: true
    },
    commissionAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'Credited'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('CommissionHistory', commissionHistorySchema);
