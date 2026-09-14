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

    if (user) {
      let singleOrders = (await PatientForm.find({ 
        ...(user.assignedForm === 'all' ? {} : { formType: user.assignedForm }),
        type: { $ne: "stockorder" }
      })).length;
      
      let stockOrders = (await PatientForm.find({ 
        ...(user.assignedForm === 'all' ? {} : { formType: user.assignedForm }),
        type: "stockorder"
      })).length;

      res.render('doctorhome', { user, singleOrders, stockOrders })
    }
    else {
      res.redirect('/')
    }
  }
  else {
    res.render('login')
  }
})

// GET all applications
router.get('/patients/:type', async (req, res) => {
  if (req.session.userId) {
    try {
      let user = await Doctor.findOne({ _id: req.session.userId })
      let type = req.params.type

      let match = { ...(user.assignedForm === 'all' ? {} : { formType: user.assignedForm }) };

      if (type == 'single') {
        match.type = { $ne: "stockorder" };
      }
      else if (type == 'stock') {
        match.type = "stockorder";
      }

      const result = await PatientForm.aggregate([
        {
          $sort: { createdAt: -1 } // latest first
        },
        {
          $match: match // <-- filter by formType and type
        },
        {
          $lookup: {
            from: "users",                // users collection
            localField: "referredBy",     // referral code in PatientForm
            foreignField: "userId",       // userId in users
            as: "coordinatorDetails"      // output array field
          }
        },
        {
          $unwind: {
            path: "$coordinatorDetails",
            preserveNullAndEmptyArrays: true // keep patients even if no coordinator match
          }
        }
      ]);
      
      res.render('forms', { applications: result, user, createOrder: false });

    } catch (error) {
      console.log(error);
      res.redirect('/')
    }
  }
  else {
    res.render('login')
  }
})

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