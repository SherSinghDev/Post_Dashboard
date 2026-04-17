let express = require('express')
let router = express.Router()
let User = require('../../modals/users')
let bcrypt = require("bcrypt")
// let Users = require('../../modals/users')
let Doctor = require('../../modals/doctors')
let PatientForm = require('../../modals/patientForm')
const patientForm = require('../../modals/patientForm')

router.get('/dashboard', async (req, res) => {
  if (req.session.userId) {
    let user = await Doctor.findOne({ _id: req.session.userId })
    console.log(user);

    if (user.email.startsWith('doctor')) {
      // let patients = (await patientForm.find({ formType: user.assignedForm })).length

      let unverifiedPatients = (await PatientForm.find({ formType: user.assignedForm, "otherStatus.doctorStatus": { $in: [null, ""] }, "otherStatus.supportStatus": { $in: [null, "", undefined] } })).length
      let varifiedPatients = (await PatientForm.find({
        formType: user.assignedForm,
        "otherStatus.doctorStatus": { $nin: [null, ""] },
        "otherStatus.trackingIdStatus": { $in: [null, ""] },
        "otherStatus.deliveryStatus": { $nin: ["delivered", "Delivered", "DELIVERED"] }
      })).length
      let pendingpatients = (await PatientForm.find({
        formType: user.assignedForm,
        "otherStatus.doctorStatus": { $in: [null, ""] },
        "otherStatus.supportStatus": { $nin: [null, ""] },
        "otherStatus.trackingIdStatus": { $in: [null, ""] },
        "otherStatus.deliveryStatus": { $nin: ["delivered", "Delivered", "DELIVERED"] }
      })).length
      let patientsOrders = (await PatientForm.find({
        formType: user.assignedForm,
        // "otherStatus.doctorStatus": { $nin: [null, ""] },
        "otherStatus.trackingIdStatus": { $nin: [null, ""] },
        "otherStatus.deliveryStatus": { $nin: ["delivered", "Delivered", "DELIVERED"] }
      })).length

      // console.log(patients);
      res.render('doctorhome', { user, unverifiedPatients, varifiedPatients, pendingpatients, patientsOrders })
    }
    else {
      res.redirect('/')
    }
  }
  else {
    res.render('login')
    // res.render('login')
  }
})


// GET all applications
router.get('/patients/:type', async (req, res) => {
  if (req.session.userId) {
    try {
      let user = await Doctor.findOne({ _id: req.session.userId })
      // const applications = await PatientForm.find().sort({ createdAt: -1 });
      let type = req.params.type

      let match = { formType: user.assignedForm, "otherStatus.doctorStatus": { $in: [null, ""] }, "otherStatus.supportStatus": { $in: [null, "", undefined] } }

      if (type == 'unverified') {
        match = { formType: user.assignedForm, "otherStatus.doctorStatus": { $in: [null, ""] }, "otherStatus.supportStatus": { $in: [null, "", undefined] } }
      }
      else if (type == 'verified') {
        match = {
          formType: user.assignedForm,
          "otherStatus.doctorStatus": { $nin: [null, ""] },
          "otherStatus.trackingIdStatus": { $in: [null, ""] },
          "otherStatus.deliveryStatus": { $nin: ["delivered", "Delivered", "DELIVERED"] }
        }
      }
      else if (type == 'pending') {
        match = {
          formType: user.assignedForm,
          "otherStatus.doctorStatus": { $in: [null, ""] },
          "otherStatus.supportStatus": { $nin: [null, ""] },
          "otherStatus.trackingIdStatus": { $in: [null, ""] },
          "otherStatus.deliveryStatus": { $nin: ["delivered", "Delivered", "DELIVERED"] }
        }
      }
      else if (type == 'orders') {
        match = {
          formType: user.assignedForm,
          "otherStatus.trackingIdStatus": { $nin: [null, ""] }
        }
      }

      const result = await PatientForm.aggregate([
        {
          $sort: { createdAt: -1 } // latest first
        },
        {
          $match: match // <-- filter by formType
        },
        {
          $lookup: {
            from: "users",                // users collection
            localField: "referredBy",     // referral code in PatientForm
            foreignField: "referralCode", // referral code in User
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
            registerNo: 1,
            otherStatus: 1,
            createdAt: 1,
            // only select _id and name from the referred user
            "referrer._id": 1,
            "referrer.name": 1
          }
        }
      ]);

      // console.log(result);


      res.render('forms', { applications: result, user, createOrder: false });
    } catch (error) {
      console.log(error);
      res.redirect('/auth/login')
    }
  }
  else {
    res.redirect('/auth/login')
  }
});





// 👉 Route: Create Dummy Doctors
router.get("/", async (req, res) => {
  try {
    const forms = ["form1", "form2", "form3", "form4", "form5", "form6"];

    const existingDoctors = await Doctor.find();
    if (existingDoctors.length > 0) {
      return res
        .status(400)
        .json({ message: "Doctors already exist. Remove them first if needed." });
    }

    const hashedPassword = await bcrypt.hash("doctor123", 10);

    const dummyDoctors = forms.map((form, index) => ({
      name: `Doctor ${index + 1}`,
      email: `doctor${index + 1}@bsrf.com`,
      password: hashedPassword,
      assignedForm: form,
    }));

    await Doctor.insertMany(dummyDoctors);

    res.status(201).json({
      message: "Dummy doctors created successfully!",
      doctors: dummyDoctors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating dummy doctors", error });
  }
});







router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role, city, referredBy } = req.body;

    // Check duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists", created: false });

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    let teamLeaderId = null;
    let finalReferredBy = null;

    if (role === "Coordinator") {
      // Must have a valid team leader referral
      const leader = await User.findOne({ referralCode: referredBy });
      if (!leader || leader.role !== "Team Leader") {
        return res.status(400).json({ message: "Invalid referral code", created: false });
      }
      teamLeaderId = leader._id;
      finalReferredBy = leader.referralCode;
    }

    const user = new User({
      name: username,
      email,
      password: hashedPassword,
      role,
      city,
      teamLeaderId,
      referredBy: finalReferredBy,
    });

    await user.save();

    res.status(201).json({
      message:
        role === "Team Leader"
          ? "Team Leader registered successfully"
          : "Coordinator registered successfully",
      //   referralCode: user.referralCode,
      created: true
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Error in server", created: false });
  }
});





module.exports = router