let express = require('express')
const router = express.Router();
const multer = require('multer');
const path = require('path');
let Users = require('../../modals/users')
const UserApplication = require('../../modals/applications'); // adjust path as needed

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
  '/apply',
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'idDocument', maxCount: 1 },
    { name: 'otherDocument', maxCount: 1 },
    { name: 'receiptUrl', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const {
        name,
        gender,
        dateOfBirth,
        relationType,
        relationWith,
        profession,
        bloodGroup,
        state,
        district,
        mobile,
        aadharNo,
        block,
        village,
        fullAddress,
        pinCode,
        role,
        email,
        idType,
        membershipType,
        referredBy,
        paymentMode
      } = req.body;

      // extract file paths safely
      const profilePicture = req.files['profilePicture'] ? `/uploads/documents/${req.files['profilePicture'][0].filename}` : null;
      const idDocument = req.files['idDocument'] ? `/uploads/documents/${req.files['idDocument'][0].filename}` : null;
      const otherDocument = req.files['otherDocument'] ? `/uploads/documents/${req.files['otherDocument'][0].filename}` : null;
      const receiptUrl = req.files['receiptUrl'] ? `/uploads/documents/${req.files['receiptUrl'][0].filename}` : null;

      // create a new application document
      const newApplication = new UserApplication({
        name,
        gender,
        dateOfBirth,
        relationType,
        relationWith,
        profession,
        bloodGroup,
        state,
        district,
        mobile,
        aadharNo,
        block,
        village,
        fullAddress,
        pinCode,
        email,
        profilePicture,
        idType,
        idDocument,
        otherDocument,
        membershipType,
        referredBy,
        role,
        payment: {
          mode: paymentMode,
          receiptUrl
        }
      });

      await newApplication.save();

      res.status(201).json({
        created: true,
        message: 'Application submitted successfully!',
        data: newApplication
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

router.get('/all', async (req, res) => {
  let data = await UserApplication.find()
  res.json(data)
})

// GET all applications
router.get('/applied', async (req, res) => {


  if (req.session.userId) {
    try {
      let user = await Users.findOne({ _id: req.session.userId })
      const applications = await UserApplication.find().sort({ createdAt: -1 });
      res.render('applications', { applications, page: "All Applications",user });
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
router.delete('/api/applications/:id', async (req, res) => {
  try {
    await UserApplication.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


router.get('/', async (req, res) => {
  res.render('applicationform')
})

module.exports = router;
