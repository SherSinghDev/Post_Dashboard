let mongoose = require('mongoose')

const generateTrackingId = () => {
    // Example: TRK-20250913-ABC123 (date + random)
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TRK-${datePart}-${randomPart}`;
};

const patientSchema = new mongoose.Schema(
    {
        idNo: {
            type: String,
            required: true,
            unique: true, // Assuming each patient has a unique ID No.
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        fatherName: {
            type: String,
            trim: true,
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Other"], // You can adjust options if needed
            required: true,
        },
        mobileNo: {
            type: String,
            required: true,
            //   match: /^[6-9]\d{9}$/, // Basic validation for Indian mobile numbers
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
            // match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email format validation
        },
        trackingId: {
            type: String,
            default: generateTrackingId, // auto-generate if not provided
            unique: true,
        },
        city: {
            type: String,
            trim: true,
        },
        state: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            default: "Active",
        },
        deliveryStatus: {
            type: String,
            enum: ["Delivered", "On Delivery", "Canceled"], // Customize as per your system
            default: "On Delivery",
        },
        authority: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true } // adds createdAt and updatedAt
);

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
