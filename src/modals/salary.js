const mongoose = require('mongoose');
const { Schema } = mongoose;

const salarySchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    deliveriesCount: {
        type: Number,
        required: true
    },
    receiptUrl: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "Paid"
    }
}, { timestamps: true });

module.exports = mongoose.model('SalaryTransaction', salarySchema);
