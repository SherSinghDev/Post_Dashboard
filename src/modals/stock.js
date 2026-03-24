const mongoose = require('mongoose');
const { Schema } = mongoose;

const stockSchema = new mongoose.Schema({
    totalStock: {
        type: Number,
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
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

module.exports = mongoose.model('stock', stockSchema)
