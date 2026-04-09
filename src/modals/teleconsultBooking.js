const mongoose = require('mongoose');

const teleconsultBookingSchema = new mongoose.Schema({
    phone: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    country: { type: String, default: 'India' },
    dob: { type: String },
    age: { type: Number },
    gender: { type: String },
    speciality: { type: String, required: true },
    bookingDate: { type: String, required: true },
    hours: { type: String },
    minutes: { type: String },
    meridian: { type: String },
    reason: { type: String },
    comments: { type: String },
    status: { type: String, enum: ['Unverified', 'Verified'], default: 'Unverified' }
}, { timestamps: true });

module.exports = mongoose.model('TeleconsultBooking', teleconsultBookingSchema);
