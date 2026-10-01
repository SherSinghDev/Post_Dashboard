const mongoose = require('mongoose');

// Assuming the connection URI is in .env or hardcoded
const MONGODB_URI = 'mongodb+srv://sherpost:FelisLeoMongo@cluster0.ma4tnzs.mongodb.net/parceldb?appName=Cluster0';

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const Users = mongoose.model('Users', new mongoose.Schema({}, { strict: false }));
    const users = await Users.find({ role: { $regex: /stock/i } });
    console.log("Found stock users:", users.map(u => u.role));
    
    // Also find some patient forms to check their type
    const PatientForm = mongoose.model('PatientForm', new mongoose.Schema({}, { strict: false, collection: 'patientforms' }));
    const forms = await PatientForm.find({}, { type: 1 }).limit(100);
    const types = [...new Set(forms.map(f => f.type))];
    console.log("Patient form types in DB:", types);
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
  });
