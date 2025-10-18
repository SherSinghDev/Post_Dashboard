const mongoose = require('mongoose');
const { Schema } = mongoose;

const userApplySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  relationType: {
    // S/O, D/O, W/O etc.
    type: String,
    trim: true,
  },
  relationWith: {
    type: String,
    trim: true,
  },
  profession: {
    type: String,
    enum: [
      "Government Job",
      "Private Job",
      "Police",
      "Army",
      "Farmer",
      "Self Business",
      "Student",
      "Social Worker",
      "House Wife",
    ],
  },
  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  aadharNo: {
    type: String,
    required: true,
  },
  block: {
    type: String,
  },
  village: {
    type: String,
  },
  fullAddress: {
    type: String,
    required: true,
  },
  pinCode: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  profilePicture: {
    type: String,
  },
  idType: {
    type: String,
    enum: [
      "Aadhar Card",
      "PAN Card",
      "Voter Card",
      "Driving Licence",
      "Rashan Card",
      "Class 10th Marksheet",
    ],
  },
  approveStatus: {
    type: String,
    enum: [
      "Approved",
      "Pending",
      "Cancelled",
    ],
    default: "Pending",
  },
  idDocument: {
    type: String,
  },
  position: {
    type: String,
  },
  otherDocument: {
    type: String,
  },
  membershipType: {
    type: String,
    enum: [
      "One year Membership Fee (₹365)",
      "Life time membership Fee (₹500)",
      "One year membership Fee And Life time membership Fee (₹865)"
    ],
    required: true,
  },

  referredBy: { type: String, default: null, trim: true }, // Team Leader referral code
  referralCode: { type: String, unique: true, trim: true },
  teamLeaderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", trim: true },
  payment: {
    mode: {
      type: String,
      enum: [
        "Bank Transfer Slip",
        "Paytm",
        "Google Pay",
        "Phonepe",
        "Amazon Pay",
        "Cheque",
        "Cash",
        "Other"
      ],
      required: true,
    },
    receiptUrl: {
      type: String,
    },

  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Export the model
module.exports = mongoose.model('UserApplication', userApplySchema);
