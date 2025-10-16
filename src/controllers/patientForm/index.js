let express = require('express')
const router = express.Router();
const multer = require('multer');
const path = require('path');
let Users = require('../../modals/users')
const PatientForm = require('../../modals/patientForm'); // adjust path as needed

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
      } = req.body;

      // extract file paths safely
      let medicalReport = req.file ? `/uploads/documents/${req.file.filename}` : null;
      
      
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
        medicalReport
      });

      await newApplication.save();

      res.status(201).json({
        created: true,
        message: 'Form submitted successfully!',
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
      const applications = await PatientForm.find().sort({ createdAt: -1 });
      res.render('forms', { applications, page: "Patient Form Data", user });
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
router.get('/one/:id', async (req, res) => {
  try {
    const app = await UserApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ success: false });
    res.json({ success: true, data: app });
  } catch (err) {
    console.log(err);

    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE application
router.delete('/delete/:id', async (req, res) => {
  try {
    await UserApplication.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


router.get('/', async (req, res) => {
  res.render('patientform')
})

// Approve or Cancel Application
router.post('/approve/:id/:action', async (req, res) => {
  try {
    const { action } = req.params;
    const valid = ["approve", "cancel"].includes(action);
    if (!valid) return res.json({ success: false, message: "Invalid action" });

    const status = action === "approve" ? "Approved" : "Cancelled";
    await UserApplication.findByIdAndUpdate(req.params.id, { approveStatus: status });

    if (status === "Approved") {
      let appUser = await UserApplication.findOne({ _id: req.params.id }).select('-approveStatus -_id -__v -createdAt')
      let newUser = new Users({
        payment: {
          mode: appUser.payment.mode,
          receiptUrl: appUser.payment.receiptUrl
        },
        name: appUser.name,
        gender: appUser.gender,
        dateOfBirth: appUser.dateOfBirth,
        relationType: appUser.relationType,
        relationWith: appUser.relationWith,
        profession: appUser.profession,
        bloodGroup: appUser.bloodGroup,
        state: appUser.state,
        district: appUser.district,
        mobile: appUser.mobile,
        role: appUser.role,
        aadharNo: appUser.aadharNo,
        block: appUser.block,
        village: appUser.village,
        fullAddress: appUser.fullAddress,
        pinCode: appUser.pinCode,
        email: appUser.email,
        profilePicture: appUser.profilePicture,
        idType: appUser.idType,
        idDocument: appUser.idDocument,
        otherDocument: appUser.otherDocument,
        membershipType: appUser.membershipType,
        referredBy: appUser.referredBy
      })

      await newUser.save()
      console.log(newUser);
    }



    res.json({ success: true });
  } catch (err) {
    console.log(err);

    res.json({ success: false, message: err.message });
  }
});



module.exports = router;
