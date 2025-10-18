const mongoose = require("mongoose");
const { Schema } = mongoose;

const patientFormSchema = new Schema({
  patientName: {
    type: String,
    required: true,
    trim: true,
  },
  fatherOrHusbandName: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  houseOrStreet: {
    type: String,
    required: true,
    trim: true,
  },
  locality: {
    type: String,
    required: true,
    trim: true,
  },
  cityOrDistrict: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  landmark: {
    type: String,
    required: true,
    trim: true,
  },
  pinCode: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  emergencyContact: {
    type: String,
  },
  referredBy: {
    type: String,
  },
  diseaseName: {
    type: String,
    required: true,
  },
  medicalReport: {
    type: String,
    // required: true,
  },
  otherStatus: {
    patientStatus: { type: String, default: "" },
    doctorStatus: { type: String, default: "" },
    supportStatus: { type: String, default: "" },
    officeStatus: { type: String, default: "" },
    adminStatus: { type: String, default: "" },
    postOfficeStatus: { type: String, default: "" },
    trackingIdStatus: { type: String, default: "" },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PatientForm", patientFormSchema);
