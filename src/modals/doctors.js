const mongoose = require("mongoose");
const { Schema } = mongoose;

const doctorSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  assignedForm: {
    type: String,
    enum: ["form1", "form2", "form3", "form4", "form5", "form6"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Doctor", doctorSchema);
