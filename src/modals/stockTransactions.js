const mongoose = require("mongoose");
const { Schema } = mongoose;

const stockTransactionSchema = new Schema({
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
    OrthoCare: {
        type: Number,
    },
    DetoxCare: {
        type: Number,
    },
    ParentsWellnessCare: {
        type: Number,
    },
    ImmunityBoosterCare: {
        type: Number,
    },
    DiabetesCare: {
        type: Number,
    },
    HeartCare: {
        type: Number,
    },
    DigestiveCare: {
        type: Number,
    },
    EyeCare: {
        type: Number,
    },
    WeightLossCare: {
        type: Number,
    },
    EnergyAndWeaknessCare: {
        type: Number,
    },
    HairCare: {
        type: Number,
    },
    SkinCare: {
        type: Number,
    },
    ThyroidCare: {
        type: Number,
    },
    LiverAndKidneyCare: {
        type: Number,
    },
    LadiesWellnessCare: {
        type: Number,
    },
    InfinityMaleWellness: {
        type: Number,
    },
    InfinityFemaleWellness: {
        type: Number,
    },
    PilesCare: {
        type: Number,
    },
    AsthmaCare: {
        type: Number,
    },
    NeuroCare: {
        type: Number,
    },
    BloodPurifierCare: {
        type: Number,
    },
    BrainAndMemoryCare: {
        type: Number,
    },
    PowerWellnessCare: {
        type: Number,
    },
    TotalWellnessCare: {
        type: Number,
    },
    totalStock: {
        type: Number,
    },
    status: {
        type: String,
    },
    
}, { timestamps: true });

module.exports = mongoose.model("StockTransaction", stockTransactionSchema);
