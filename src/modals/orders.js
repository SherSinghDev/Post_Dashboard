let  mongoose =  require("mongoose")

const patientParcelSchema = new mongoose.Schema({
  serialNumber: { type: Number },
  barcodeNo: { type: String, required: true },
  physicalWeight: { type: Number },
  receiver: {
    name: { type: String },
    addressLine1: { type: String },
    addressLine2: { type: String },
    addressLine3: { type: String },
    city: { type: String },
    pincode: { type: Number },
    stateUT: { type: String },
    contact: { type: String },
    altContact: { type: String },
    email: { type: String },
    kyc: { type: String },
    taxRef: { type: String },
  },
  parcelDetails: {
    ack: { type: Boolean, default: false },
    altAddressFlag: { type: Boolean, default: false },
    bulkReference: { type: String },
    bookingDate: { type: Date },
    deliveryStatus: { type: String, default: "On Delivery" },
    trackingId: { type: String },
  },
  sender: {
    addressLine1: { type: String },
    addressLine2: { type: String },
    addressLine3: { type: String },
  },
  metadata: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
});

module.exports =  mongoose.model("PatientParcel", patientParcelSchema);
