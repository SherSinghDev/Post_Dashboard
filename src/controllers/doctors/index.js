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

      // Get today's counts
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      let singleOrdersToday = (await PatientForm.find({ 
        ...(user.assignedForm === 'all' ? {} : { formType: user.assignedForm }),
        type: { $ne: "stockorder" },
        createdAt: { $gte: todayStart, $lte: todayEnd }
      })).length;
      
      let stockOrdersToday = (await PatientForm.find({ 
        ...(user.assignedForm === 'all' ? {} : { formType: user.assignedForm }),
        type: "stockorder",
        createdAt: { $gte: todayStart, $lte: todayEnd }
      })).length;

      res.render('doctorhome', { user, singleOrders, stockOrders, singleOrdersToday, stockOrdersToday })
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

      // Add date filtering
      let dateQuery = req.query.date;
      if (!dateQuery) {
        // default to current date
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateQuery = `${yyyy}-${mm}-${dd}`;
      }

      let startDate = new Date(dateQuery);
      startDate.setHours(0, 0, 0, 0);
      let endDate = new Date(dateQuery);
      endDate.setHours(23, 59, 59, 999);
      match.createdAt = { $gte: startDate, $lte: endDate };

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
            as: "referrer"      // output array field
          }
        },
        {
          $unwind: {
            path: "$referrer",
            preserveNullAndEmptyArrays: true // keep patients even if no coordinator match
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
        }
      ]);
      
      res.render('forms', { applications: result, user, createOrder: false, selectedDate: dateQuery, pageType: type });

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