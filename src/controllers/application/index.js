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
const stock = require('../../modals/stock');
const { sendToSuperfone } = require('../../services/superfoneWebhook');
const { sendSalaryGuideEmail } = require('../../services/resendService');

const fs = require('fs');

// ===== MULTER CONFIGURATION =====
const uploadDir = path.join(__dirname, '../../assets/uploads/documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

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
        position,
        assignedDistrict
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

      let parentUserDoc = null;
      if (referredBy) {
        parentUserDoc = await Users.findOne({ userId: referredBy.trim() });
        if (parentUserDoc && !referrerName) {
          referrerName = parentUserDoc.name;
        }
      }

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
        referredBy: referredBy || null,
        parentUser: parentUserDoc ? parentUserDoc._id : null,
        referralCode,
        role: "Coordinator",
        referrerName: referrerName || (parentUserDoc ? parentUserDoc.name : null),
        type,
        position,
        assignedDistrict,
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
    { name: 'selfPhoto', maxCount: 1 },
    { name: 'idProofFront', maxCount: 1 },
    { name: 'idProofBack', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      let {
        name,
        address,
        mob,
        qualification,
        isExperienced,
        experiences,
        age,
        post
      } = req.body;

      // Extract file paths safely
      const selfPhotoUrl = req.files['selfPhoto'] ? `/uploads/documents/${req.files['selfPhoto'][0].filename}` : null;
      const idProofFrontUrl = req.files['idProofFront'] ? `/uploads/documents/${req.files['idProofFront'][0].filename}` : null;
      const idProofBackUrl = req.files['idProofBack'] ? `/uploads/documents/${req.files['idProofBack'][0].filename}` : null;

      // Ensure experiences is parsed properly if sent as string or array
      let parsedExperiences = [];
      if (isExperienced === 'true' || isExperienced === true) {
          if (typeof experiences === 'string') {
              try {
                  parsedExperiences = JSON.parse(experiences);
              } catch (e) {
                  console.error('Error parsing experiences:', e);
              }
          } else if (Array.isArray(experiences)) {
              parsedExperiences = experiences;
          }
      }

      // Create a new application document
      let newApplication = new rojgaar({
        name,
        address,
        mob,
        qualification,
        isExperienced: isExperienced === 'true' || isExperienced === true,
        experiences: parsedExperiences,
        age,
        post,
        selfPhoto: selfPhotoUrl,
        idProofFront: idProofFrontUrl,
        idProofBack: idProofBackUrl,
      });

      await newApplication.save();

      // Forward to Superfone webhook integration
      const nameParts = (name || '').trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const superfonePayload = {
        first_name: firstName,
        last_name: lastName,
        email: [],
        additional_info: `Qualification: ${qualification || 'N/A'}, Age: ${age || 'N/A'}, Experienced: ${isExperienced || 'N/A'}, Post: ${post || 'N/A'}`,
        customer_phone: mob ? String(mob).trim() : '',
        source: "Rojgaar Form",
        leadgroupid: 123,
        source_type: "rojgaar_form",
        address: {
          text: address || ''
        }
      };

      sendToSuperfone(superfonePayload).catch(err => {
        console.error("Superfone rojgaar form webhook call error:", err);
      });

      res.status(201).json({
        created: true,
        message: 'Application submitted successfully!',
        data: newApplication
      });
    } catch (error) {
      console.error('Error saving user application:', error);
      res.status(500).json({
        created: false,
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

router.post('/check-district-head', async (req, res) => {
  try {
    const { assignedDistrict } = req.body;
    if (!assignedDistrict) {
      return res.status(400).json({ success: false, message: 'Assigned district is required' });
    }
    
    // Check in users first
    const existingUser = await Users.findOne({ 
      type: 'stockorder', 
      position: 'District Head',
      assignedDistrict: { $regex: new RegExp(`^${assignedDistrict}$`, 'i') },
      isSuspended: { $ne: true }
    });

    if (existingUser) {
      return res.json({ available: false, message: 'District head position is already taken for this district.' });
    }

    // Optionally, check if there is an approved or pending application as well
    const existingApp = await UserApplication.findOne({
      type: 'stockorder',
      position: 'District Head',
      assignedDistrict: { $regex: new RegExp(`^${assignedDistrict}$`, 'i') },
      approveStatus: { $ne: 'Rejected' }
    });

    if (existingApp) {
      return res.json({ available: false, message: 'District head position is already taken or under review for this district.' });
    }

    return res.json({ available: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

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
              assignedDistrict: 1,
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
              assignedDistrict: 1,
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
      
      let baseMatch = {};
      if (user.role == "Coordinator") {
        baseMatch.parentUser = user._id;
      }
      baseMatch.approveStatus = { $nin: ["Approved", "Cancelled"] };

      // Compute counts for tabs/filter buttons
      const countAgg = await rojgaar.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: { $toLower: "$approveStatus" },
            count: { $sum: 1 }
          }
        }
      ]);

      let counts = { all: 0, pending: 0, interested: 0, notInterested: 0 };
      countAgg.forEach(c => {
        counts.all += c.count;
        if (c._id === "interested") counts.interested += c.count;
        else if (c._id === "not interested" || c._id === "not_interested") counts.notInterested += c.count;
        else counts.pending += c.count;
      });

      // Filter query based on req.query.status
      let matchQuery = { ...baseMatch };
      const currentStatus = (req.query.status || 'all').toLowerCase().trim();

      if (currentStatus === 'pending') {
        matchQuery.approveStatus = { $in: ["Pending", "pending", null] };
      } else if (currentStatus === 'interested') {
        matchQuery.approveStatus = { $in: ["Interested", "interested"] };
      } else if (currentStatus === 'not interested' || currentStatus === 'not_interested') {
        matchQuery.approveStatus = { $in: ["Not Interested", "not interested"] };
      }

      let result = await rojgaar.aggregate([
        {
          $match: matchQuery
        },
        {
          $sort: { createdAt: -1 } // latest first
        },
        {
          $lookup: {
            from: "users",              // collection name
            localField: "parentUser",   // field in UserApplication
            foreignField: "_id",        // field in User
            as: "referrer",             // alias for matched user
          },
        },
        {
          $unwind: {
            path: "$referrer",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            name: 1,
            address: 1,
            mob: 1,
            qualification: 1,
            isExperienced: 1,
            experiences: 1,
            age: 1,
            selfPhoto: 1,
            idProofFront: 1,
            idProofBack: 1,
            post: 1,
            approveStatus: 1,
            referredBy: 1,
            referrerName: 1,
            type: 1,
            position: 1,
            createdAt: 1,
            'referrer._id': 1,
            'referrer.name': 1,
          }
        },
      ]);

      let users = await Users.find({ role: "Coordinator" }).select('name referralCode userId -_id');

      res.render('rojgaarsathi', { 
        applications: result, 
        page: "Rojgaar Sathi", 
        user, 
        users,
        currentStatus,
        counts
      });
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
          parentUser: 1,
          type: 1,
          position: 1,
          assignedDistrict: 1,
          payment: 1,
          createdAt: 1,

          // only name and id for referral user
          'referralUser._id': 1,
          'referralUser.name': 1,
        }
      }
    ]);

    let appData = result[0] || {};
    let parents = await users.find({ type: appData.type });
    let options = '<option value="">Direct Came (No Parent User)</option>';
    parents.forEach((p) => {
      if (p.type) {
        let isSelected = (appData.parentUser && appData.parentUser.toString() === p._id.toString()) ? 'selected' : '';
        options += `<option value="${p._id}" ${isSelected}>${p.name} - ${p.district || 'N/A'} - (${p.position}) [ID: ${p.userId || 'N/A'}]</option>`;
      }
    });



    if (!result.length) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    res.json({ success: true, data: result[0], options });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// GET single rojgaar application
router.get('/rojgaar/one/:id', async (req, res) => {
  try {
    const result = await rojgaar.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(req.params.id) }
      },
      {
        $lookup: {
          from: 'users',
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
          name: 1,
          address: 1,
          mob: 1,
          qualification: 1,
          isExperienced: 1,
          experiences: 1,
          age: 1,
          selfPhoto: 1,
          idProofFront: 1,
          idProofBack: 1,
          post: 1,
          approveStatus: 1,
          referredBy: 1,
          referrerName: 1,
          createdAt: 1,
          // only name and id for referral user
          'referralUser._id': 1,
          'referralUser.name': 1,
        }
      }
    ]);

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


router.delete('/rojgaar/delete/:id', async (req, res) => {
  try {
    await rojgaar.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update status of Rojgaar application (pending, interested, not interested)
const handleRojgaarStatusUpdate = async (req, res) => {
  try {
    const { status } = req.body;
    let formattedStatus = "Pending";
    if (status) {
      const lower = status.toLowerCase().trim();
      if (lower === "interested") formattedStatus = "Interested";
      else if (lower === "not interested" || lower === "not_interested") formattedStatus = "Not Interested";
      else if (lower === "pending") formattedStatus = "Pending";
      else formattedStatus = status;
    }

    const updated = await rojgaar.findByIdAndUpdate(
      req.params.id,
      { $set: { approveStatus: formattedStatus } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    res.json({
      success: true,
      message: `Status updated to ${formattedStatus}`,
      status: formattedStatus
    });
  } catch (err) {
    console.error("Error updating rojgaar status:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

router.post('/rojgaar/update-status/:id', handleRojgaarStatusUpdate);
router.put('/rojgaar/update-status/:id', handleRojgaarStatusUpdate);
router.post('/rojgaar/status/:id', handleRojgaarStatusUpdate);


router.get('/type/:type', async (req, res) => {
  let type = req.params.type;
  let users;
  if (type === 'stockorder') {
    users = await Users.find({ type: 'stockorder' }).select('name userId position city district -_id');
  } else {
    users = await Users.find({ role: "Coordinator" }).select('name referralCode userId city position district -_id');
  }
  let user = '';
  res.render('applicationform', { users, user, type });
});

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
        assignedDistrict,
      } = req.body;

      console.log(req.body);


      let appUser = await UserApplication.findOne({ _id: req.params.id }).select('-approveStatus -_id -__v -createdAt');
      if (!appUser) {
        appUser = await rojgaar.findOne({ _id: req.params.id }).select('-approveStatus -_id -__v -createdAt');
      }

      // extract file paths safely
      const profilePicture = req.files && req.files['profilePicture'] ? `/uploads/documents/${req.files['profilePicture'][0].filename}` : (appUser ? appUser.profilePicture : '');
      const idDocument = req.files && req.files['idDocument'] ? `/uploads/documents/${req.files['idDocument'][0].filename}` : (appUser ? appUser.idDocument : '');
      const otherDocument = req.files && req.files['otherDocument'] ? `/uploads/documents/${req.files['otherDocument'][0].filename}` : (appUser ? appUser.otherDocument : '');
      const receiptUrl = req.files && req.files['receiptUrl'] ? `/uploads/documents/${req.files['receiptUrl'][0].filename}` : (appUser && appUser.payment ? appUser.payment.receiptUrl : '');

      let referralCode = "TL-" + nanoid(6).toUpperCase();

      await UserApplication.findByIdAndUpdate(req.params.id, { approveStatus: "Approved" });
      await rojgaar.findByIdAndUpdate(req.params.id, { approveStatus: "Approved" });

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
        assignedDistrict,
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
        parentUser: parentuser || null,
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

      // Send Salary Guide Email via Resend for Single Order users only (not for stock order)
      try {
        const userType = (type || (appUser && appUser.type) || '').toLowerCase().trim();
        const isStockOrder = userType === 'stockorder' || userType === 'stock_order';
        const recipientEmail = (email || (appUser && appUser.email) || '').trim();

        if (!isStockOrder && recipientEmail) {
          const candidateName = name || (appUser && appUser.name) || 'Candidate';
          const candidatePosition = position || (appUser && appUser.position) || 'Field Officer';

          sendSalaryGuideEmail({
            to: recipientEmail,
            name: candidateName,
            position: candidatePosition
          }).then((emailResult) => {
            if (emailResult && emailResult.success) {
              console.log(`[Resend] Successfully sent salary guide to ${recipientEmail} for position ${candidatePosition}`);
            } else {
              console.error(`[Resend] Failed to send email to ${recipientEmail}:`, emailResult ? emailResult.error : 'Unknown error');
            }
          }).catch((err) => {
            console.error(`[Resend] Error sending email to ${recipientEmail}:`, err.message);
          });
        } else if (isStockOrder) {
          console.log(`[Resend] Skipping salary guide email: user "${name}" is of stock order type.`);
        } else if (!recipientEmail) {
          console.log(`[Resend] Skipping salary guide email: no email address provided for user "${name}".`);
        }
      } catch (emailErr) {
        console.error('[Resend] Unexpected error triggering salary guide email:', emailErr);
      }

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
