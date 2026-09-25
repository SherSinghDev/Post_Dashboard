const fs = require('fs');
const path = 'C:\\Users\\Acer\\Desktop\\ERA\\any web\\dashboard\\Server\\src\\controllers\\patientForm\\index.js';
let content = fs.readFileSync(path, 'utf8');

// The route starts with:
// router.get('/pendingpatients', async (req, res) => {
// ...
//       if (user.role == "Coordinator") {

const searchStr = `router.get('/pendingpatients', async (req, res) => {
  if (req.session.userId) {
    try {
      let user = await Users.findOne({ _id: req.session.userId })
      // const applications = await PatientForm.find().sort({ createdAt: -1 });
      let result
      let createOrder = true
      if (user.role == "Coordinator") {`;

const replacementStr = `router.get('/pendingpatients', async (req, res) => {
  if (req.session.userId) {
    try {
      let user = await Users.findOne({ _id: req.session.userId })
      // const applications = await PatientForm.find().sort({ createdAt: -1 });
      let result
      let createOrder = true
      
      if (user.type == "stockorder") {
        let dateQuery = req.query.date;
        if (!dateQuery) {
          const today = new Date();
          const yyyy = today.getFullYear();
          const mm = String(today.getMonth() + 1).padStart(2, '0');
          const dd = String(today.getDate()).padStart(2, '0');
          dateQuery = \`\${yyyy}-\${mm}-\${dd}\`;
        }
        let startDate = new Date(dateQuery);
        startDate.setHours(0, 0, 0, 0);
        let endDate = new Date(dateQuery);
        endDate.setHours(23, 59, 59, 999);

        result = await PatientForm.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate },
              referredBy: user.userId,
              "otherStatus.trackingIdStatus": { $nin: [null, ""] },
              "otherStatus.deliveryStatus": { $nin: ["delivered", "Delivered", "DELIVERED"] }
            }
          },
          { $sort: { createdAt: -1 } },
          {
            $lookup: {
              from: "users",
              localField: "referredBy",
              foreignField: "userId",
              as: "referrer"
            }
          },
          { $unwind: { path: "$referrer", preserveNullAndEmptyArrays: true } },
          {
            $graphLookup: {
              from: "users",
              startWith: "$referrer.parentUser",
              connectFromField: "parentUser",
              connectToField: "_id",
              as: "allParents",
              depthField: "level"
            }
          },
          {
            $project: {
              patientName: 1, fatherOrHusbandName: 1, gender: 1, houseOrStreet: 1, locality: 1, cityOrDistrict: 1, state: 1, landmark: 1, pinCode: 1, mobileNumber: 1, emergencyContact: 1, referredBy: 1, diseaseName: 1, medicalReport: 1, otherStatus: 1, registerNo: 1, createdAt: 1, duration: 1, type: 1, "referrer": 1, "allParents": 1
            }
          }
        ]);
      } else if (user.role == "Coordinator") {`;

content = content.replace(searchStr, replacementStr);
fs.writeFileSync(path, content);
console.log("Updated correctly");
