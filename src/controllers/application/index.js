let express = require('express')
const router = express.Router();
let mongoose = require('mongoose')
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
      let {
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
        // role,
        email,
        idType,
        membershipType,
        referredBy,
        paymentMode
      } = req.body;

      // ✅ Check if email already exists in Users collection
      const existingUser = await Users.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return res.status(400).json({
          created: false,
          message: 'This email is already registered as a user. Please use a different email or contact support.'
        });
      }

      // extract file paths safely
      const profilePicture = req.files['profilePicture'] ? `/uploads/documents/${req.files['profilePicture'][0].filename}` : null;
      const idDocument = req.files['idDocument'] ? `/uploads/documents/${req.files['idDocument'][0].filename}` : null;
      const otherDocument = req.files['otherDocument'] ? `/uploads/documents/${req.files['otherDocument'][0].filename}` : null;
      const receiptUrl = req.files['receiptUrl'] ? `/uploads/documents/${req.files['receiptUrl'][0].filename}` : null;

      // create a new application document
      let newApplication = new UserApplication({
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
        role:"Coordinator",
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
      // const applications = await UserApplication.find().sort({ createdAt: -1 });

      const result = await UserApplication.aggregate([
        {
          $sort: { createdAt: -1 } // latest first
        },
        {
          $lookup: {
            from: "users",              // collection name (must match in lowercase plural)
            localField: "referredBy",   // field in UserApplication
            foreignField: "referralCode", // field in User
            as: "referrer",             // alias for matched user
          },
        },
        {
          $unwind: {
            path: "$referrer",
            preserveNullAndEmptyArrays: true, // keep even if no referrer found
          },
        },
        {
          $project: {
            // keep all original fields
            name: 1,
            gender: 1,
            dateOfBirth: 1,
            relationType: 1,
            relationWith: 1,
            profession: 1,
            bloodGroup: 1,
            state: 1,
            district: 1,
            mobile: 1,
            role: 1,
            aadharNo: 1,
            block: 1,
            village: 1,
            fullAddress: 1,
            pinCode: 1,
            email: 1,
            profilePicture: 1,
            idType: 1,
            approveStatus: 1,
            idDocument: 1,
            otherDocument: 1,
            membershipType: 1,
            referredBy: 1,
            payment: 1,
            createdAt: 1,
            // only specific fields from referral user
            'referrer._id': 1,
            'referrer.name': 1,
          }
        },
      ]);


      // console.log(result);



      res.render('applications', { applications: result, page: "All Applications", user });
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
    const result = await UserApplication.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(req.params.id) }
      },
      {
        $lookup: {
          from: 'users', // same collection name
          localField: 'referredBy',
          foreignField: 'referralCode',
          as: 'referralUser'
        }
      },
      {
        $unwind: {
          path: '$referralUser',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          // all fields from main application
          name: 1,
          gender: 1,
          dateOfBirth: 1,
          relationType: 1,
          relationWith: 1,
          profession: 1,
          bloodGroup: 1,
          state: 1,
          district: 1,
          mobile: 1,
          role: 1,
          aadharNo: 1,
          block: 1,
          village: 1,
          fullAddress: 1,
          pinCode: 1,
          email: 1,
          profilePicture: 1,
          idType: 1,
          approveStatus: 1,
          idDocument: 1,
          otherDocument: 1,
          membershipType: 1,
          referredBy: 1,
          payment: 1,
          createdAt: 1,

          // only name and id for referral user
          'referralUser._id': 1,
          'referralUser.name': 1,
        }
      }
    ]);

    // console.log(result);


    if (!result.length) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    res.json({ success: true, data: result[0] });

  } catch (err) {
    console.error(err);
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
  let users = await Users.find({ role: "Team Leader" }).select('name referralCode -_id');
  // console.log(users);
  res.render('applicationform', { users })
})

// Approve or Cancel Application
router.post('/approve/:id/:action/:pos', async (req, res) => {
  try {
    const { action, pos } = req.params;
    const valid = ["approve", "cancel"].includes(action);
    if (!valid) return res.json({ success: false, message: "Invalid action" });

    const status = action === "approve" ? "Approved" : "Cancelled";
    await UserApplication.findByIdAndUpdate(req.params.id, { approveStatus: status, position: pos });

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
