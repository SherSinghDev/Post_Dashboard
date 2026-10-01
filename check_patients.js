const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb+srv://sherpost:FelisLeoMongo@cluster0.ma4tnzs.mongodb.net/parceldb?appName=Cluster0');
  
  const PatientForm = mongoose.model('PatientForm', new mongoose.Schema({}, { strict: false }));
  
  const types = await PatientForm.aggregate([
    { $group: { _id: "$type", count: { $sum: 1 } } }
  ]);
  
  console.log("Types:", types);
  
  const stockOrders = await PatientForm.find({ type: "stockorder" }).select('createdAt type formType');
  console.log("Stock Orders Count:", stockOrders.length);
  if (stockOrders.length > 0) {
    console.log("Sample stock order:", stockOrders[0]);
  }
  
  process.exit(0);
}

check().catch(console.error);
