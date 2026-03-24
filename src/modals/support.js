const mongoose = require('mongoose');
const { Schema } = mongoose;

const supportTicketSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        unique: true
    },

    userId: {
        type: String,
        required: true
    },

    username: {
        type: String,
        required: true
    },

    mobile: {
        type: String,
        required: true
    },


    userRole: {
        type: String,
        // enum: ['Customer', 'Seller', 'Coordinator'],
        required: true
    },

    category: {
        type: String,
        enum: [
            'Parcel Delay',
            'Lost Parcel',
            'Payment Issue',
            'Pickup Issue',
            'Return Issue',
            'Other'
        ],
        required: true
    },

    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM'
    },

    parcelId: String,

    issueSummary: String,

    status: {
        type: String,
        enum: [
            'OPEN',
            'CALLING',
            'IN_PROGRESS',
            'RESOLVED',
            'ESCALATED',
            'CLOSED'
        ],
        default: 'OPEN'
    },

    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SupportAgent',
        default: null
    },

    callLogs: [
        {
            calledAt: Date,
            duration: Number, // seconds
            outcome: {
                type: String,
                enum: ['CONNECTED', 'NO_ANSWER', 'BUSY', 'INVALID']
            }
        }
    ],

    resolutionNote: String,

    createdAt: {
        type: Date,
        default: Date.now
    },

    resolvedAt: Date
});

module.exports = mongoose.model('supportticket', supportTicketSchema)
