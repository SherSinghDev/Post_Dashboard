const mongoose = require('mongoose');
const { Schema } = mongoose;

const supportAgentSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,

    status: {
        type: String,
        enum: ['AVAILABLE', 'BUSY', 'OFFLINE'],
        default: 'AVAILABLE'
    },

    activeTicket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SupportTicket',
        default: null
    }
});

module.exports = mongoose.model('supportagent', supportAgentSchema)

