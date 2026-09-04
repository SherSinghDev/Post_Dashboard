let express = require('express')
const router = express.Router();
const multer = require('multer');
let Users = require('../../modals/users');
let Orders = require('../../modals/orders');
const PatientForm = require('../../modals/patientForm');
const { sendToSuperfone } = require('../../services/superfoneWebhook');

// ===== MULTER CONFIGURATION =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './src/assets/uploads/documents'); // ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
});

const upload = multer({ storage });

// ===== POST ROUTE =====
router.post(
  '/form',
  upload.single('medicalReport'),
  async (req, res) => {
    try {
      let {
        patientName,
        fatherOrHusbandName,
        gender,
        houseOrStreet,
        locality,
        cityOrDistrict,
        state,
        landmark,
        pinCode,
        mobileNumber,
        emergencyContact,
        diseaseName,
        referredBy,
        formType,
        duration,
        type

      } = req.body;

      let ref = referredBy || "Filled By Patient";

      // Check if mobile or emergency number already exists anywhere
      const existingPatient = await PatientForm.findOne({
        $or: [
          { mobileNumber: mobileNumber },
          { emergencyContact: mobileNumber },
          { mobileNumber: emergencyContact },
          { emergencyContact: emergencyContact }
        ]
      });

      if (existingPatient) {
        return res.status(400).json({
          created: false,
          message: "This number is already used as a mobile or emergency contact for another patient."
        });
      }

      // extract file paths safely
      let medicalReport = req.file ? `/uploads/documents/${req.file.filename}` : null;

      // 🧩 Find the last patient entry for this formType
      const lastPatient = await PatientForm.findOne({ formType })
        .sort({ createdAt: -1 })
        .select("registerNo");

      let nextNumber = 1;

      if (lastPatient && lastPatient.registerNo) {
        const parts = lastPatient.registerNo.split("-");
        const lastNumber = parseInt(parts[1], 10);
        if (!isNaN(lastNumber)) nextNumber = lastNumber + 1;
      }

      // 🆔 Format the new register number (formType-XX)
      const registerNo = `${formType}-${String(nextNumber).padStart(2, "0")}`;

      // create a new application document
      let newApplication = new PatientForm({
        patientName,
        fatherOrHusbandName,
        gender,
        houseOrStreet,
        locality,
        cityOrDistrict,
        state,
        landmark,
        pinCode,
        mobileNumber,
        emergencyContact,
        diseaseName,
        medicalReport,
        referredBy: ref,
        formType,
        duration,
        type,
        registerNo, // add the generated register number
      });

      await newApplication.save();

      // Forward to Superfone webhook integration
      const nameParts = (patientName || '').trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      const fullAddressText = [houseOrStreet, locality, landmark, cityOrDistrict, state, pinCode].filter(Boolean).join(', ');

      const superfonePayload = {
        first_name: firstName,
        last_name: lastName,
        email: [],
        additional_info: `Disease: ${diseaseName || 'N/A'}, Duration: ${duration || 'N/A'}, Type: ${type || 'N/A'}, Form Type: ${formType || 'N/A'}, Register No: ${registerNo || 'N/A'}, Referred By: ${ref || 'N/A'}, Emergency Contact: ${emergencyContact || 'N/A'}`,
        customer_phone: mobileNumber ? String(mobileNumber).trim() : '',
        source: "Patient Form",
        leadgroupid: 123,
        source_type: formType || "patient_form",
        address: {
          text: fullAddressText || `${cityOrDistrict || ''}, ${state || ''}`.trim()
        }
      };

      sendToSuperfone(superfonePayload).catch(err => {
        console.error("Superfone patient form webhook call error:", err);
      });

      const payload = {
        sender: "917417271707",
        to: `+91${mobileNumber}`,
        templateId: '861990016887116',

        // If template has header
        //   headerVariables: ["https://bol7.com/logo.png"],

        bodyVariables: patientName,

        // If template has button
        //   buttonVariables: ["Verify Now"],
      };

      const response = await fetch(
        "https://chat.bol7.com/api/whatsapp/SendTemplate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log("Bol7 Response:", data);

      res.status(201).json({
        created: true,
        message: `Form submitted successfully! <br> Note Your Registration No. <b>${registerNo}</b>`,
        registerNo,
      });
    } catch (error) {
      console.error('Error saving user application:', error);
      res.status(500).json({
        created: false,
        message: 'Server error while submitting application.',
        error: error.message
      });
    }
  }
);


// router.get('/all', async (req, res) => {
//   let data = await UserApplication.find()
//   res.json(data)
// })

// GET all applications
router.get('/patients', async (req, res) => {
  if (req.session.userId) {
    try {
      let user = await Users.findOne({ _id: req.session.userId })
      // const applications = await PatientForm.find().sort({ createdAt: -1 });
      let result
      let createOrder = false
      if (user.role == "Coordinator") {
        result = await PatientForm.aggregate([
          {
            $match: { referredBy: user.userId, "otherStatus.doctorStatus": { $in: [null, ""] }, "otherStatus.supportStatus": { $in: [null, "", undefined] }, } // latest first
          },
          {
            $sort: { createdAt: -1 } // latest first
          },
          {
            $lookup: {
              from: "users",                // users collection
              localField: "referredBy",     // referral code in PatientForm
              foreignField: "userId", // referral code in User
              as: "referrer"
            }
          },
          {
            $unwind: {
              path: "$referrer",
              preserveNullAndEmptyArrays: true // keep even if no referrer
            }
          },
          {
            $project: {
              patientName: 1,
              fatherOrHusbandName: 1,
              gender: 1,
              houseOrStreet: 1,
              locality: 1,
              cityOrDistrict: 1,
              state: 1,
              landmark: 1,
              pinCode: 1,
              mobileNumber: 1,
              emergencyContact: 1,
              referredBy: 1,
              diseaseName: 1,
              medicalReport: 1,
              otherStatus: 1,
              registerNo: 1,
              createdAt: 1,
              duration: 1,
              type: 1,
              // only select _id and name from the referred user
              "referrer._id": 1,
              "referrer.name": 1,
              "referrer.userId": 1
            }
          }
        ]);
      }
      else {

        result = await PatientForm.aggregate([
          {
            $match: { "otherStatus.doctorStatus": { $in: [null, ""] }, "otherStatus.supportStatus": { $in: [null, "", undefined] } } // latest first
          },
          {
            $sort: { createdAt: -1 } // latest first
          },
          {
            $lookup: {
              from: "users",                // users collection
              localField: "referredBy",     // referral code in PatientForm
              foreignField: "userId", // referral code in User
              as: "referrer"
            }
          },
          {
            $unwind: {
              path: "$referrer",
              preserveNullAndEmptyArrays: true // keep even if no referrer
            }
          },
          {
            $project: {
              patientName: 1,
              fatherOrHusbandName: 1,
              gender: 1,
              houseOrStreet: 1,
              locality: 1,
              cityOrDistrict: 1,
              state: 1,
              landmark: 1,
              pinCode: 1,
              mobileNumber: 1,
              emergencyContact: 1,
              referredBy: 1,
              diseaseName: 1,
              medicalReport: 1,
              otherStatus: 1,
              registerNo: 1,
              createdAt: 1,
              duration: 1,
              type: 1,
              // only select _id and name from the referred user
              "referrer._id": 1,
              "referrer.name": 1,
              "referrer.userId": 1
            }
          }
        ]);
      }
      console.log(result[0]);
      res.render('forms', { applications: result, page: "Patient Form Data", user, createOrder });
    } catch (error) {
      console.log(error);
      res.redirect('/auth/login')
    }
  }
  else {
    res.redirect('/auth/login')
  }
});



// get all doctor verified
router.get('/varifiedpatients', async (req, res) => {
  if (req.session.userId) {
    try {
      let user = await Users.findOne({ _id: req.session.userId })
      // const applications = await PatientForm.find().sort({ createdAt: -1 });
      let result
      let createOrder = true
      if (user.role == "Coordinator") {
        result = await PatientForm.aggregate([
          {
            $match: {
              referredBy: user.userId,
              "otherStatus.doctorStatus": { $nin: [null, ""] },
              "otherStatus.trackingIdStatus": { $in: [null, ""] },
              "otherStatus.deliveryStatus": { $nin: ["delivered", "Delivered", "DELIVERED"] }
            }
          }
          ,
          {
            $sort: { createdAt: -1 } // latest first
          },
          {
            $lookup: {
              from: "users",                // users collection
              localField: "referredBy",     // referral code in PatientForm
              foreignField: "userId", // referral code in User
              as: "referrer"
            }
          },
          {
            $unwind: {
              path: "$referrer",
              preserveNullAndEmptyArrays: true // keep even if no referrer
            }
          },
          {
            $project: {
              patientName: 1,
              fatherOrHusbandName: 1,
              gender: 1,
              houseOrStreet: 1,
              locality: 1,
              cityOrDistrict: 1,
              state: 1,
              landmark: 1,
              pinCode: 1,
              mobileNumber: 1,
              emergencyContact: 1,
              referredBy: 1,
              diseaseName: 1,
              medicalReport: 1,
              otherStatus: 1,
              registerNo: 1,
              createdAt: 1,
              duration: 1,
              type: 1,
              // only select _id and name from the referred user
              "referrer._id": 1,
              "referrer.name": 1,
              "referrer.userId": 1
            }
          }
        ]);
      }
      else {

        result = await PatientForm.aggregate([
          {
            $match: {
              "otherStatus.doctorStatus": { $nin: [null, ""] },
              "otherStatus.trackingIdStatus": { $in: [null, ""] },
              "otherStatus.deliveryStatus": { $nin: ["delivered", "Delivered", "DELIVERED"] }
            }
          }
          ,
          {
            $sort: { createdAt: -1 } // latest first
          },
          {
            $lookup: {
              from: "users",                // users collection
              localField: "referredBy",     // referral code in PatientForm
              foreignField: "userId", // referral code in User
              as: "referrer"
            }
          },
          {
            $unwind: {
              path: "$referrer",
              preserveNullAndEmptyArrays: true // keep even if no referrer
            }
          },
          {
            $project: {
              patientName: 1,
              fatherOrHusbandName: 1,
              gender: 1,
              houseOrStreet: 1,
              locality: 1,
              cityOrDistrict: 1,
              state: 1,
              landmark: 1,
              pinCode: 1,
              mobileNumber: 1,
              emergencyContact: 1,
              referredBy: 1,
              diseaseName: 1,
              medicalReport: 1,
              otherStatus: 1,
              registerNo: 1,
              createdAt: 1,
              duration: 1,
              type: 1,
              // only select _id and name from the referred user
              "referrer._id": 1,
              "referrer.name": 1,
              "referrer.userId": 1
            }
          }
        ]);
      }


      // console.log(result);
      res.render('forms', { applications: result, page: "Patient Form Data", user, createOrder });
    } catch (error) {
      console.log(error);
      res.redirect('/auth/login')
    }
  }
  else {
    res.redirect('/auth/login')
  }
});



// get all doctor verified
router.get('/notinterestedpatients', async (req, res) => {
  if (req.session.userId) {
    try {
      let user = await Users.findOne({ _id: req.session.userId })
      // const applications = await PatientForm.find().sort({ createdAt: -1 });
      let result
      let createOrder = false

      result = await PatientForm.aggregate([
        {
          $match: {
            "otherStatus.patientStatus": "not interested",
            "otherStatus.supportStatus": "not interested",
            "otherStatus.officeStatus": "not interested",
            "otherStatus.adminStatus": "not interested",
            "otherStatus.postOfficeStatus": "not interested",
            "otherStatus.trackingIdStatus": "not interested",
            "otherStatus.deliveryStatus": "not interested"
          }
        }
        ,
        {
          $sort: { createdAt: -1 } // latest first
        },
        {
          $lookup: {
            from: "users",                // users collection
            localField: "referredBy",     // referral code in PatientForm
            foreignField: "userId", // referral code in User
            as: "referrer"
          }
        },
        {
          $unwind: {
            path: "$referrer",
            preserveNullAndEmptyArrays: true // keep even if no referrer
          }
        },
        {
          $project: {
            patientName: 1,
            fatherOrHusbandName: 1,
            gender: 1,
            houseOrStreet: 1,
            locality: 1,
            cityOrDistrict: 1,
            state: 1,
            landmark: 1,
            pinCode: 1,
            mobileNumber: 1,
            emergencyContact: 1,
            referredBy: 1,
            diseaseName: 1,
            medicalReport: 1,
            otherStatus: 1,
            registerNo: 1,
            createdAt: 1,
            duration: 1,
            type: 1,
            // only select _id and name from the referred user
            "referrer._id": 1,
            "referrer.name": 1,
            "referrer.userId": 1
          }
        }
      ]);



      // console.log(result);
      res.render('forms', { applications: result, page: "Not Interested Patient Data", user, createOrder, notInterested: true });
    } catch (error) {
      console.log(error);
      res.redirect('/auth/login')
    }
  }
  else {
    res.redirect('/auth/login')
  }
});


// pending patient
router.get('/pendingpatients', async (req, res) => {
  if (req.session.userId) {
    try {
      let user = await Users.findOne({ _id: req.session.userId })
      // const applications = await PatientForm.find().sort({ createdAt: -1 });
      let result
      let createOrder = true
      if (user.role == "Coordinator") {
        result = await PatientForm.aggregate([
          {
            $match: {
              referredBy: user.userId,
              "otherStatus.doctorStatus": { $in: [null, ""] },
              "otherStatus.supportStatus": { $nin: [null, ""] },
              "otherStatus.trackingIdStatus": { $in: [null, ""] },
              "otherStatus.deliveryStatus": { $nin: ["delivered", "Delivered", "DELIVERED"] }
            }
          }
          ,
          {
            $sort: { createdAt: -1 } // latest first
          },
          {
            $lookup: {
              from: "users",                // users collection
              localField: "referredBy",     // referral code in PatientForm
              foreignField: "userId", // referral code in User
              as: "referrer"
            }
          },
          {
            $unwind: {
              path: "$referrer",
              preserveNullAndEmptyArrays: true // keep even if no referrer
            }
          },
          {
            $project: {
              patientName: 1,
              fatherOrHusbandName: 1,
              gender: 1,
              houseOrStreet: 1,
              locality: 1,
              cityOrDistrict: 1,
              state: 1,
              landmark: 1,
              pinCode: 1,
              mobileNumber: 1,
              emergencyContact: 1,
              referredBy: 1,
              diseaseName: 1,
              medicalReport: 1,
              otherStatus: 1,
              registerNo: 1,
              createdAt: 1,
              duration: 1,
              type: 1,
              // only select _id and name from the referred user
              "referrer._id": 1,
              "referrer.name": 1,
              "referrer.userId": 1
            }
          }
        ]);
      }
      else {

        result = await PatientForm.aggregate([
          {
            $match: {
              "otherStatus.doctorStatus": { $in: [null, ""] },
              "otherStatus.supportStatus": { $nin: [null, ""] },
              "otherStatus.trackingIdStatus": { $in: [null, ""] },
              "otherStatus.deliveryStatus": { $nin: ["delivered", "Delivered", "DELIVERED"] }
            }
          }
          ,
          {
            $sort: { createdAt: -1 } // latest first
          },
          {
            $lookup: {
              from: "users",                // users collection
              localField: "referredBy",     // referral code in PatientForm
              foreignField: "userId", // referral code in User
              as: "referrer"
            }
          },
          {
            $unwind: {
              path: "$referrer",
              preserveNullAndEmptyArrays: true // keep even if no referrer
            }
          },
          {
            $project: {
              patientName: 1,
              fatherOrHusbandName: 1,
              gender: 1,
              houseOrStreet: 1,
              locality: 1,
              cityOrDistrict: 1,
              state: 1,
              landmark: 1,
              pinCode: 1,
              mobileNumber: 1,
              emergencyContact: 1,
              referredBy: 1,
              diseaseName: 1,
              medicalReport: 1,
              otherStatus: 1,
              registerNo: 1,
              createdAt: 1,
              duration: 1,
              type: 1,
              // only select _id and name from the referred user
              "referrer._id": 1,
              "referrer.name": 1,
              "referrer.userId": 1
            }
          }
        ]);
      }


      // console.log(result);
      res.render('forms', { applications: result, page: "Pending Patient Data", user, createOrder });
    } catch (error) {
      console.log(error);
      res.redirect('/auth/login')
    }
  }
  else {
    res.redirect('/auth/login')
  }
});

// get all patient orders
router.get('/orders', async (req, res) => {
  if (req.session.userId) {
    try {
      let user = await Users.findOne({ _id: req.session.userId })
      // const applications = await PatientForm.find().sort({ createdAt: -1 });
      let result
      let createOrder = false
      if (user.role == "Coordinator") {
        result = await PatientForm.aggregate([
          {
            $match: {
              referredBy: user.userId,
              // "otherStatus.doctorStatus": { $nin: [null, ""] },
              "otherStatus.trackingIdStatus": { $nin: [null, ""] },
              // "otherStatus.deliveryStatus": { $nin: ["delivered", "Delivered", "DELIVERED"] }
            }
          }
          ,
          {
            $sort: { createdAt: -1 } // latest first
          },
          {
            $lookup: {
              from: "users",                // users collection
              localField: "referredBy",     // referral code in PatientForm
              foreignField: "userId", // referral code in User
              as: "referrer"
            }
          },
          {
            $unwind: {
              path: "$referrer",
              preserveNullAndEmptyArrays: true // keep even if no referrer
            }
          },
          {
            $project: {
              patientName: 1,
              fatherOrHusbandName: 1,
              gender: 1,
              houseOrStreet: 1,
              locality: 1,
              cityOrDistrict: 1,
              state: 1,
              landmark: 1,
              pinCode: 1,
              mobileNumber: 1,
              emergencyContact: 1,
              referredBy: 1,
              diseaseName: 1,
              medicalReport: 1,
              otherStatus: 1,
              registerNo: 1,
              createdAt: 1,
              duration: 1,
              type: 1,
              // only select _id and name from the referred user
              "referrer._id": 1,
              "referrer.name": 1,
              "referrer.userId": 1
            }
          }
        ]);
      }
      else {

        result = await PatientForm.aggregate([
          {
            $match: {
              // "otherStatus.doctorStatus": { $nin: [null, ""] },
              "otherStatus.trackingIdStatus": { $nin: [null, ""] },
              // "otherStatus.deliveryStatus": { $nin: ["delivered", "Delivered", "DELIVERED"] }
            }
          }
          ,
          {
            $sort: { createdAt: -1 } // latest first
          },
          {
            $lookup: {
              from: "users",                // users collection
              localField: "referredBy",     // referral code in PatientForm
              foreignField: "userId", // referral code in User
              as: "referrer"
            }
          },
          {
            $unwind: {
              path: "$referrer",
              preserveNullAndEmptyArrays: true // keep even if no referrer
            }
          },
          {
            $project: {
              patientName: 1,
              fatherOrHusbandName: 1,
              gender: 1,
              houseOrStreet: 1,
              locality: 1,
              cityOrDistrict: 1,
              state: 1,
              landmark: 1,
              pinCode: 1,
              mobileNumber: 1,
              emergencyContact: 1,
              referredBy: 1,
              diseaseName: 1,
              medicalReport: 1,
              otherStatus: 1,
              registerNo: 1,
              createdAt: 1,
              duration: 1,
              type: 1,
              // only select _id and name from the referred user
              "referrer._id": 1,
              "referrer.name": 1,
              "referrer.userId": 1
            }
          }
        ]);
      }


      // console.log(result);
      res.render('forms', { applications: result, page: "Patient Form Data", user, createOrder });
    } catch (error) {
      console.log(error);
      res.redirect('/auth/login')
    }
  }
  else {
    res.redirect('/auth/login')
  }
});

// delivered
// get all patient orders
router.get('/delivered', async (req, res) => {
  if (req.session.userId) {
    try {
      let user = await Users.findOne({ _id: req.session.userId })
      // const applications = await PatientForm.find().sort({ createdAt: -1 });
      let result
      let createOrder = false
      if (user.role == "Coordinator") {
        result = await PatientForm.aggregate([
          {
            $match: {
              referredBy: user.userId,
              "otherStatus.deliveryStatus": { $in: ["delivered", "Delivered", "DELIVERED"] }
            }
          }
          ,
          {
            $sort: { createdAt: -1 } // latest first
          },
          {
            $lookup: {
              from: "users",                // users collection
              localField: "referredBy",     // referral code in PatientForm
              foreignField: "userId", // referral code in User
              as: "referrer"
            }
          },
          {
            $unwind: {
              path: "$referrer",
              preserveNullAndEmptyArrays: true // keep even if no referrer
            }
          },
          {
            $project: {
              patientName: 1,
              fatherOrHusbandName: 1,
              gender: 1,
              houseOrStreet: 1,
              locality: 1,
              cityOrDistrict: 1,
              state: 1,
              landmark: 1,
              pinCode: 1,
              mobileNumber: 1,
              emergencyContact: 1,
              referredBy: 1,
              diseaseName: 1,
              medicalReport: 1,
              otherStatus: 1,
              registerNo: 1,
              createdAt: 1,
              duration: 1,
              type: 1,
              // only select _id and name from the referred user
              "referrer._id": 1,
              "referrer.name": 1,
              "referrer.userId": 1
            }
          }
        ]);
      }
      else {

        result = await PatientForm.aggregate([
          {
            $match: {
              "otherStatus.deliveryStatus": { $in: ["delivered", "Delivered", "DELIVERED"] }
            }
          }
          ,
          {
            $sort: { createdAt: -1 } // latest first
          },
          {
            $lookup: {
              from: "users",                // users collection
              localField: "referredBy",     // referral code in PatientForm
              foreignField: "userId", // referral code in User
              as: "referrer"
            }
          },
          {
            $unwind: {
              path: "$referrer",
              preserveNullAndEmptyArrays: true // keep even if no referrer
            }
          },
          {
            $project: {
              patientName: 1,
              fatherOrHusbandName: 1,
              gender: 1,
              houseOrStreet: 1,
              locality: 1,
              cityOrDistrict: 1,
              state: 1,
              landmark: 1,
              pinCode: 1,
              mobileNumber: 1,
              emergencyContact: 1,
              referredBy: 1,
              diseaseName: 1,
              medicalReport: 1,
              otherStatus: 1,
              registerNo: 1,
              createdAt: 1,
              duration: 1,
              type: 1,
              // only select _id and name from the referred user
              "referrer._id": 1,
              "referrer.name": 1,
              "referrer.userId": 1
            }
          }
        ]);
      }


      // console.log(result);
      res.render('forms', { applications: result, page: "Patient Form Data", user, createOrder });
    } catch (error) {
      console.log(error);
      res.redirect('/auth/login')
    }
  }
  else {
    res.redirect('/auth/login')
  }
});

// GET single application (for View Modal)
router.get('/details/:id', async (req, res) => {
  try {
    const app = await PatientForm.findById(req.params.id);
    if (!app) return res.status(404).json({ success: false });

    // let refUser = await Users.findOne({ userId: app.referredBy }).select('name')
    // console.log(refUser);
    // console.log(app);



    res.json({ success: true, data: app });
  } catch (err) {
    console.log(err);

    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single application (for report Modal)
router.get('/report/:id', async (req, res) => {
  try {
    const app = await PatientForm.findById(req.params.id);
    if (!app) return res.status(404).json({ success: false });
    let report = app.medicalReport
    res.json({ success: true, report });
  } catch (err) {
    console.log(err);

    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE application
router.delete('/delete/:id', async (req, res) => {
  try {
    let user = await Users.findOne({ _id: req.session.userId })
    if (user.role == "Admin") {
      await PatientForm.findByIdAndUpdate(req.params.id, {
        $set: {
          "otherStatus.patientStatus": "not interested",
          "otherStatus.supportStatus": "not interested",
          "otherStatus.officeStatus": "not interested",
          "otherStatus.adminStatus": "not interested",
          "otherStatus.postOfficeStatus": "not interested",
          "otherStatus.trackingIdStatus": "not interested",
          "otherStatus.deliveryStatus": "not interested"
        }
      });
      res.json({ success: true });
    } else {
      res.json({ success: false, message: "You are not authorized to delete this form" });

    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// RESTORE application
router.put('/restore/:id', async (req, res) => {
  try {
    let user = await Users.findOne({ _id: req.session.userId })
    if (user.role == "Admin") {
      await PatientForm.findByIdAndUpdate(req.params.id, {
        $set: {
          "otherStatus.patientStatus": "",
          "otherStatus.supportStatus": "",
          "otherStatus.officeStatus": "",
          "otherStatus.adminStatus": "",
          "otherStatus.postOfficeStatus": "",
          "otherStatus.trackingIdStatus": "",
          "otherStatus.deliveryStatus": "",
          "otherStatus.doctorStatus": ""
        }
      });
      res.json({ success: true });
    } else {
      res.json({ success: false, message: "You are not authorized to restore this form" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// new forms
router.get('/:userid', async (req, res) => {
  let id = req.params.userid
  let type = 'singleorder'
  let user = await Users.findOne({ userId: id }).select('type')
  let users = await Users.find({ role: "Coordinator" }).select('name referralCode userId -_id');
  let forms = ["form1", 'form2', 'form3', 'form4', 'form5', 'form6']
  let random = Math.floor(Math.random() * 6)

  // let formType = req.params.formType
  let formType = forms[random]
  if (user && user.type) {
    type = user.type
  }
  // console.log(user ? user.type : null);
  // console.log(random);

  console.log(type);

  res.render('patientform', { users, formType, id, type })
})


router.get('/:formType', async (req, res) => {
  let users = await Users.find({ role: "Coordinator" }).select('name referralCode -_id');
  let formType = req.params.formType
  // console.log(users);
  res.render('patientform', { users, formType })
})

// Approve or Cancel Application
// router.post('/approve/:id', async (req, res) => {
//   try {
//     let {
//       patientStatus,
//       doctorStatus,
//       supportStatus,
//       officeStatus,
//       adminStatus,
//       postOfficeStatus,
//       trackingIdStatus,
//     } = req.body

//     let formUser = await PatientForm.findByIdAndUpdate(
//       req.params.id,
//       {
//         otherStatus: {
//           patientStatus,
//           doctorStatus,
//           supportStatus,
//           officeStatus,
//           adminStatus,
//           postOfficeStatus,
//           trackingIdStatus,
//         },
//       }
//     )


//     res.json({ success: true });
//   } catch (err) {
//     console.log(err);

//     res.json({ success: false, message: err.message });
//   }
// });


router.post(
  '/approve/:id',
  upload.single('medicalReport'),
  async (req, res) => {
    try {
      let {
        patientName,
        fatherOrHusbandName,
        gender,
        houseOrStreet,
        locality,
        cityOrDistrict,
        state,
        landmark,
        pinCode,
        mobileNumber,
        emergencyContact,
        diseaseName,
        // referredBy,
        // formType,
        patientStatus,
        doctorStatus,
        supportStatus,
        officeStatus,
        adminStatus,
        postOfficeStatus,
        trackingIdStatus,
        deliveryStatus,
        duration
      } = req.body;

      // let ref = referredBy || "Filled By Patient";

      // extract file paths safely
      // let medicalReport = req.file ? `/uploads/documents/${req.file.filename}` : null;

      // 🧩 Find the last patient entry for this formType


      // update application document
      let formUser = await PatientForm.findByIdAndUpdate(
        req.params.id,
        {
          patientName,
          fatherOrHusbandName,
          gender,
          houseOrStreet,
          locality,
          cityOrDistrict,
          state,
          landmark,
          pinCode,
          mobileNumber,
          emergencyContact,
          diseaseName,
          duration,
          // medicalReport,
          // referredBy: ref,
          // formType,
          otherStatus: {
            patientStatus,
            doctorStatus,
            supportStatus,
            officeStatus,
            adminStatus,
            postOfficeStatus,
            trackingIdStatus,
            deliveryStatus
          },
        }
      )

      console.log(formUser);


      let tempId;


      if (doctorStatus && !trackingIdStatus && !["delivered", "Delivered", "DELIVERED"].includes(deliveryStatus)) {
        // varified
        tempId = '1635479647448877'
      }
      else if (supportStatus && !trackingIdStatus && !["delivered", "Delivered", "DELIVERED"].includes(deliveryStatus)) {
        // pending
        tempId = '2319899531822263'
      }

      const payload = {
        sender: "917417271707",
        to: `+91${mobileNumber}`,
        templateId: tempId,

        // If template has header
        //   headerVariables: ["https://bol7.com/logo.png"],

        bodyVariables: patientName,

        // If template has button
        //   buttonVariables: ["Verify Now"],
      };

      const response = await fetch(
        "https://chat.bol7.com/api/whatsapp/SendTemplate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log("Bol7 Response:", data);



      res.json({ success: true });
    } catch (error) {
      console.log(error);

      res.json({ success: false, message: error.message });
    }
  }
);



module.exports = router;
