const mongoose = require('mongoose');
const PatientForm = require('../src/modals/patientForm'); // Fix path to modals
const Users = require('../src/modals/users');

mongoose.connect('mongodb+srv://sherpost:FelisLeoMongo@cluster0.ma4tnzs.mongodb.net/parceldb?appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log("Connected to DB");

  let matchQuery = {
    "otherStatus.doctorStatus": { $in: [null, ""] },
    "otherStatus.supportStatus": { $in: [null, "", undefined] },
    type: { $ne: "stockorder" }
  };

  let result = await PatientForm.aggregate([
    {
      $match: matchQuery
    },
    {
      $sort: { createdAt: -1 } // latest first
    },
    {
      $lookup: {
        from: "users",
        localField: "referredBy",
        foreignField: "userId",
        as: "referrer"
      }
    },
    {
      $unwind: {
        path: "$referrer",
        preserveNullAndEmptyArrays: true
      }
    },
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
        patientName: 1,
        referredBy: 1,
        "referrer": 1,
        "allParents": 1
      }
    },
    { $limit: 3 }
  ]);

  console.log("\nTEST WITH ONLY REFERRER: 1 (LATEST 3):");
  console.log(JSON.stringify(result, null, 2));

  process.exit();
}).catch(err => {
  console.error("DB connection error", err);
  process.exit(1);
});
