let express = require('express')
const router = express.Router();
let mongoose = require('mongoose')
const path = require('path');
let Users = require('../../modals/users')
const UserApplication = require('../../modals/applications'); // adjust path as needed
let { nanoid } = require('nanoid');
const multer = require('multer');
let bcrypt = require("bcrypt");
const users = require('../../modals/users');
const rojgaar = require('../../modals/rojgaar');

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
      // console.log(req.body);

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
        paymentMode,
        referrerName,
        type,
        position
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

      let referralCode = "TL-" + nanoid(6).toUpperCase()

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
        referralCode,
        role: "Coordinator",
        referrerName,
        type,
        position,
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
        // message: 'Server error while submitting application.',
        message: error.message,
        error: "Error in Server"
      });
    }
  }
);

// ===== POST ROUTE =====
router.post(
  '/rojgaar/apply',
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'idDocument', maxCount: 1 },
    { name: 'otherDocument', maxCount: 1 },
    { name: 'receiptUrl', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      // console.log(req.body);

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
        paymentMode,
        referrerName,
        type,
        position
      } = req.body;

      // ✅ Check if email already exists in Users collection
      const existingUser = await rojgaar.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return res.status(400).json({
          created: false,
          message: 'This email is already registered in a Form. Please use a different email or contact support.'
        });
      }

      // extract file paths safely
      const profilePicture = req.files['profilePicture'] ? `/uploads/documents/${req.files['profilePicture'][0].filename}` : null;
      const idDocument = req.files['idDocument'] ? `/uploads/documents/${req.files['idDocument'][0].filename}` : null;
      const otherDocument = req.files['otherDocument'] ? `/uploads/documents/${req.files['otherDocument'][0].filename}` : null;
      const receiptUrl = req.files['receiptUrl'] ? `/uploads/documents/${req.files['receiptUrl'][0].filename}` : null;

      let referralCode = "TL-" + nanoid(6).toUpperCase()

      // create a new application document
      let newApplication = new rojgaar({
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
        referralCode,
        role: "Coordinator",
        referrerName,
        type,
        position,
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
        // message: 'Server error while submitting application.',
        message: error.message,
        error: "Error in Server"
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
      let result;
      if (user.role == "Coordinator") {
        result = await UserApplication.aggregate([
          {
            $sort: { createdAt: -1 } // latest first
          },
          {
            $match: { approveStatus: "Pending", parentUser: user._id }
          },
          {
            $lookup: {
              from: "users",              // collection name (must match in lowercase plural)
              localField: "parentUser",   // field in UserApplication
              foreignField: "_id", // field in User
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
              referrerName: 1,
              type: 1,
              position: 1,
              payment: 1,
              createdAt: 1,
              // only specific fields from referral user
              'referrer._id': 1,
              'referrer.name': 1,
            }
          },
        ]);
      }
      else {
        result = await UserApplication.aggregate([
          {
            $sort: { createdAt: -1 } // latest first
          },
          {
            $match: { approveStatus: "Pending" }
          },
          {
            $lookup: {
              from: "users",              // collection name (must match in lowercase plural)
              localField: "parentUser",   // field in UserApplication
              foreignField: "_id", // field in User
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
              referrerName: 1,
              type: 1,
              position: 1,
              payment: 1,
              createdAt: 1,
              // only specific fields from referral user
              'referrer._id': 1,
              'referrer.name': 1,
            }
          },
        ]);
      }


      // console.log(result);
      let users = await Users.find({ role: "Coordinator" }).select('name referralCode userId -_id');


      res.render('applications', { applications: result, page: "All Applications", user, users });
    } catch (error) {
      console.log(error);
      res.redirect('/auth/login')
    }
  }
  else {
    res.redirect('/auth/login')
  }
});

// GET all applications
router.get('/rojgaar/applied', async (req, res) => {
  if (req.session.userId) {
    try {
      let user = await Users.findOne({ _id: req.session.userId })
      // const applications = await UserApplication.find().sort({ createdAt: -1 });
      let result;
      if (user.role == "Coordinator") {
        result = await rojgaar.aggregate([
          {
            $sort: { createdAt: -1 } // latest first
          },
          {
            $match: { approveStatus: "Pending", parentUser: user._id }
          },
          {
            $lookup: {
              from: "users",              // collection name (must match in lowercase plural)
              localField: "parentUser",   // field in UserApplication
              foreignField: "_id", // field in User
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
              referrerName: 1,
              type: 1,
              position: 1,
              payment: 1,
              createdAt: 1,
              // only specific fields from referral user
              'referrer._id': 1,
              'referrer.name': 1,
            }
          },
        ]);
      }
      else {
        result = await rojgaar.aggregate([
          {
            $sort: { createdAt: -1 } // latest first
          },
          {
            $match: { approveStatus: "Pending" }
          },
          {
            $lookup: {
              from: "users",              // collection name (must match in lowercase plural)
              localField: "parentUser",   // field in UserApplication
              foreignField: "_id", // field in User
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
              referrerName: 1,
              type: 1,
              position: 1,
              payment: 1,
              createdAt: 1,
              // only specific fields from referral user
              'referrer._id': 1,
              'referrer.name': 1,
            }
          },
        ]);
      }


      // console.log(result);
      let users = await Users.find({ role: "Coordinator" }).select('name referralCode userId -_id');


      res.render('rojgaarsathi', { applications: result, page: "Rojgaar Sathi", user, users });
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
          foreignField: 'userId',
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
          referrerName: 1,
          type: 1,
          position: 1,
          payment: 1,
          createdAt: 1,

          // only name and id for referral user
          'referralUser._id': 1,
          'referralUser.name': 1,
        }
      }
    ]);

    console.log(result);
    let parents = await users.find({ type: result[0].type })
    let options = '<option value="">Select Parent User</option>';
    parents.forEach((p) => {
      console.log(p.type);
      if (p.type) {
        options += `<option value="${p._id}">${p.name} (${p.position})</option>`
      }
    })



    if (!result.length) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    res.json({ success: true, data: result[0], options });

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


router.delete('/rojgaar/delete/:id', async (req, res) => {
  try {
    await rojgaar.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


router.get('/type/:type', async (req, res) => {
  let users = await Users.find({ role: "Coordinator" }).select('name referralCode userId -_id');
  let type = req.params.type
  console.log(type);
  let user = ''
  res.render('applicationform', { users, user, type })
})

router.get('/rojgaar', async (req, res) => {
  let type = 'singleorder'
  res.render('rojgaar', { type })
})



router.get('/user/:id', async (req, res) => {
  let user = await Users.findOne({ userId: req.params.id }).select('name userId -_id');
  // console.log(user);
  let users = ''
  res.render('applicationform', { user, users })
})



router.post(
  '/approve/:id',
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
        referrerName,
        paymentMode,
        head,
        authority,
        validstart,
        validend,
        panNumber,
        amount,
        type,
        position,
        parentuser,
      } = req.body;

      console.log(req.body);


      let appUser = await UserApplication.findOne({ _id: req.params.id }).select('-approveStatus -_id -__v -createdAt')


      // extract file paths safely
      const profilePicture = req.files['profilePicture'] ? `/uploads/documents/${req.files['profilePicture'][0].filename}` : appUser.profilePicture;
      const idDocument = req.files['idDocument'] ? `/uploads/documents/${req.files['idDocument'][0].filename}` : appUser.idDocument;
      const otherDocument = req.files['otherDocument'] ? `/uploads/documents/${req.files['otherDocument'][0].filename}` : appUser.otherDocument;
      const receiptUrl = req.files['receiptUrl'] ? `/uploads/documents/${req.files['receiptUrl'][0].filename}` : appUser.payment.receiptUrl;

      let referralCode = "TL-" + nanoid(6).toUpperCase()

      await UserApplication.findByIdAndUpdate(req.params.id, { approveStatus: "Approved" });

      // 🧩 Find the last patient entry for this formType
      const lastUser = await Users.findOne().sort({ createdAt: -1 }).select("userId")

      let nextNumber = 1;

      if (lastUser && lastUser.userId) {
        const lastNumber = parseInt(lastUser.userId);
        if (!isNaN(lastNumber)) nextNumber = lastNumber + 1;
      }

      // 🆔 Format the new register number (formType-XX)
      let userId = `${String(nextNumber).padStart(2, "0")}`;

      // password 
      const password = await bcrypt.hash('1234', 10);

      // create a new application document
      let newApplication = new Users({
        name,
        gender,
        password,
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
        referrerName,
        referralCode,
        head,
        authority,
        validstart,
        validend,
        panNumber,
        amount,
        userId,
        type,
        position,
        parentUser: parentuser,
        role: "Coordinator",
        payment: {
          mode: paymentMode,
          receiptUrl
        }
      });

      await newApplication.save();

      // after user creation
      await stock.create({
        userId: newApplication._id,
        totalStock: 0,
        OrthoCare: 0,
        DetoxCare: 0,
        ParentsWellnessCare: 0,
        ImmunityBoosterCare: 0,
        DiabetesCare: 0,
        HeartCare: 0,
        DigestiveCare: 0,
        EyeCare: 0,
        WeightLossCare: 0,
        EnergyAndWeaknessCare: 0,
        HairCare: 0,
        SkinCare: 0,
        ThyroidCare: 0,
        LiverAndKidneyCare: 0,
        LadiesWellnessCare: 0,
        InfinityMaleWellness: 0,
        InfinityFemaleWellness: 0,
        PilesCare: 0,
        AsthmaCare: 0,
        NeuroCare: 0,
        BloodPurifierCare: 0,
        BrainAndMemoryCare: 0,
        PowerWellnessCare: 0,
        TotalWellnessCare: 0,
      });

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully!',
        // data: newApplication
      });
    } catch (error) {
      console.error('Error saving user application:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while submitting application.',
        error: error.message
      });
    }
  }
);



module.exports = router;
