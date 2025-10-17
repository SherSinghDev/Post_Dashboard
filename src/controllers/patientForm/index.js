let express = require('express')
const router = express.Router();
const multer = require('multer');
const path = require('path');
let Users = require('../../modals/users')
let Orders = require('../../modals/orders')
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
    await PatientForm.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


router.get('/', async (req, res) => {
  res.render('patientform')
})

// Approve or Cancel Application
router.post('/approve/:id', async (req, res) => {
  try {
    let {
      patientStatus,
      doctorStatus,
      supportStatus,
      officeStatus,
      adminStatus,
      postOfficeStatus,
      trackingIdStatus,
    } = req.body

    let formUser = await PatientForm.findOne({ _id: req.params.id }).select(' -_id -__v')
    
    let newOrder = new Orders({
      serialNumber: 1,
      barcodeNo: trackingIdStatus,
      physicalWeight: "",
      receiver: {
        name: formUser.patientName,
        addressLine1: formUser.houseOrStreet,
        addressLine2: formUser.landmark,
        addressLine3: formUser.locality,
        city: formUser.cityOrDistrict,
        pincode: formUser.pinCode,
        stateUT: formUser.state,
        contact: formUser.mobileNumber,
        altContact: formUser.emergencyContact,
        email: 'N/A',
        kyc: "",
        taxRef: "",
      },
      parcelDetails: {
        
        bulkReference: "",
        bookingDate: formUser.createdAt,
        trackingId: trackingIdStatus,
      },
      otherStatus: {
        patientStatus,
        doctorStatus,
        supportStatus,
        officeStatus,
        adminStatus,
        postOfficeStatus,
      },
      sender: {
        addressLine1: "",
        addressLine2: "",
        addressLine3: "",
      },
      
    })

    await newOrder.save()
    await PatientForm.deleteOne({ _id: req.params.id })
    res.json({ success: true });
  } catch (err) {
    console.log(err);

    res.json({ success: false, message: err.message });
  }
});



module.exports = router;
