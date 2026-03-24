let express = require('express')
let router = express.Router()
let Users = require('../../modals/users')
let mongoose = require('mongoose')
const multer = require('multer');
let bcrypt = require("bcrypt")
let crypto = require("crypto");
let Payment = require('../../modals/payment')

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
let User = require('../../modals/users')
let dotenv = require('dotenv')
dotenv.config()


let Razorpay = require("razorpay");

console.log(process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET);


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});




router.post("/payment/create-order", async (req, res) => {
    try {
        const { amount, membershipType, name, email, mobile } = req.body;

        const existingUser = await User.findOne({ email });
        // console.log(existingUser);

        if (existingUser)
            return res.json({ success: false, message: "Email already exists" });

        const order = await razorpay.orders.create({
            amount: amount * 100, // paise
            currency: "INR",
            receipt: `rcpt_${Date.now()}`
        });

        await Payment.create({
            userName: name,
            email,
            mobile,
            amount,
            membershipType,
            razorpayOrderId: order.id
        });

        res.json({
            success: true,
            order,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Razorpay Error : " + err.error.description });
    }
});



router.post("/payment/verify", async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        return res.json({ success: false });
    }

    await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            status: "SUCCESS"
        }
    );

    res.json({ success: true });
});




router.get('/', async (req, res) => {
    if (req.session.userId) {
        try {
            let user = await Users.findOne({ _id: req.session.userId })

            if (user.role !== 'Admin') {
                let users = await Users.find({ parentUser: user._id }).sort({ createdAt: -1 }).populate('parentUser')
                // let refusers = await Users.find({ role: "Coordinator" }).select('name referralCode userId -_id');

                // console.log(users);
                res.render('users', { users, user, page: "Users", })
                // res.redirect('/')
            }
            else {
                let users = await Users.find().sort({ createdAt: -1 }).populate('parentUser')
                // let refusers = await Users.find({ role: "Coordinator" }).select('name referralCode userId -_id');

                res.render('users', { users, user, page: "Users", })
            }

        } catch (error) {
            console.log(error);
        }
    }
    else {
        res.redirect('/auth/login')
    }
})


// admins
router.get('/admins', async (req, res) => {
    if (req.session.userId) {
        try {
            let user = await Users.findOne({ _id: req.session.userId })

            if (user.role !== 'Admin') {
                res.redirect('/')
            }
            else {
                let users = await Users.find({ role: 'Admin' }).sort({ createdAt: -1 })
                let refusers = await Users.find({ role: "Coordinator" }).select('name referralCode userId -_id');
                // console.log(users);
                res.render('admins', { users, user, refusers, page: "Users", })
            }

        } catch (error) {
            console.log(error);
        }
    }
    else {
        res.redirect('/auth/login')
    }
})

router.get('/idcard/:id', async (req, res) => {
    if (req.session.userId) {
        try {
            let user = await Users.findOne({ _id: req.params.id })
            res.render('idcard', { user })

        } catch (error) {
            console.log(error);
        }
    }
    else {
        res.redirect('/auth/login')
    }
})

router.get('/letter/:id', async (req, res) => {
    if (req.session.userId) {
        try {
            let user = await Users.findOne({ _id: req.params.id })
            res.render('letter', { user })

        } catch (error) {
            console.log(error);
        }
    }
    else {
        res.redirect('/auth/login')
    }
})

router.get('/certificate/:id', async (req, res) => {
    if (req.session.userId) {
        try {
            let user = await Users.findOne({ _id: req.params.id })
            res.render('certificate', { user })

        } catch (error) {
            console.log(error);
        }
    }
    else {
        res.redirect('/auth/login')
    }
})

router.get('/donation/:id', async (req, res) => {
    if (req.session.userId) {
        try {
            let user = await Users.findOne({ _id: req.params.id })
            res.render('donation', { user })

        } catch (error) {
            console.log(error);
        }
    }
    else {
        res.redirect('/auth/login')
    }
})

// delete
router.delete('/delete/:id', async (req, res) => {
    let { id } = req.params
    // console.log(id);
    let deleted = false
    try {
        let del = await Users.deleteOne({ _id: id })
        // console.log(del);
        if (del.deletedCount) {
            deleted = true
            let card = `#card-${id}`
            res.json({ deleted, card })
        }

    } catch (error) {
        console.log(error);
        deleted = false
        res.json({ deleted })
    }
})



// update
// router.post('/update/:id', async (req, res) => {
//     let { id } = req.params
//     await Users.updateOne({ _id: id }, req.body)
//     let patient1 = await Users.findOne({ _id: id })
//     console.log(patient1);
//     let tdHtml = `<span>${patient1.trackingId}</span>`
//     let td = `#td-${id}`
//     res.json({ message: "Updated Successfully", td, tdHtml, updated: true })
// })


// update

// GET single application (for View Modal)
router.get('/one/:id', async (req, res) => {
    try {
        const result = await Users.aggregate([
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
                    authority: 1,
                    head: 1,
                    validstart: 1,
                    validend: 1,
                    panNumber: 1,
                    amount: 1,
                    type: 1,
                    parentUser: 1,
                    position: 1,
                    payment: 1,
                    createdAt: 1,

                    // only name and id for referral user
                    'referralUser._id': 1,
                    'referralUser.name': 1,
                }
            }
        ]);

        // console.log(result);
        let parents = await Users.find({ type: result[0].type })
        let options = '<option value="">Select Parent User</option>';
        parents.forEach((p) => {
            console.log(p.type);
            if (p.type && p._id != result[0]._id) {
                options += `<option value="${p._id}">${p.name} (${p.position})</option>`
            }
        })

        // console.log(options);




        if (!result.length) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        res.json({ success: true, data: result[0], options });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});


router.post(
    '/update/:id',
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
                paymentMode,
                head,
                authority,
                type,
                position,
                parentUser,
                validstart,
                validend,
                panNumber,
                amount
            } = req.body;

            let appUser = await Users.findOne({ _id: req.params.id }).select('-_id -__v -createdAt')


            // extract file paths safely
            const profilePicture = req.files['profilePicture'] ? `/uploads/documents/${req.files['profilePicture'][0].filename}` : appUser.profilePicture;
            const idDocument = req.files['idDocument'] ? `/uploads/documents/${req.files['idDocument'][0].filename}` : appUser.idDocument;
            const otherDocument = req.files['otherDocument'] ? `/uploads/documents/${req.files['otherDocument'][0].filename}` : appUser.otherDocument;
            const receiptUrl = req.files['receiptUrl'] ? `/uploads/documents/${req.files['receiptUrl'][0].filename}` : appUser.receiptUrl;



            // create a new application document
            let newApplication = await Users.updateOne({ _id: req.params.id }, {
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
                // referralCode,
                head,
                authority,
                validstart,
                validend,
                panNumber,
                amount,
                type,
                position,
                parentUser,
                role: "Coordinator",
                payment: {
                    mode: paymentMode,
                    receiptUrl
                }
            })

            // console.log(newApplication);


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






router.get('/profile', async (req, res) => {
    if (req.session.userId) {
        let id = req.session.userId
        try {
            let user = await Users.findOne({ _id: id })


            res.render('profile', { page: "User Profile", user })
        } catch (error) {
            console.log(error);
            res.redirect('/auth/login')
        }
    }
    else {
        res.redirect('/auth/login')
    }

})



router.post('/update-password', async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await Users.findOne({ _id: req.session.userId });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.json({ updated: false, message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ updated: true });
});


router.get('/coordinators', async (req, res) => {
    if (req.session.userId) {
        try {
            let user = await Users.findOne({ _id: req.session.userId })

            if (user.role !== 'Team Leader') {
                res.redirect('/')
            }
            else {
                let users = await Users.find({ role: "Coordinator", referredBy: user.referralCode })
                // console.log(users);
                res.render('coordinator', { users, user, page: "My Coordinators" })
            }

        } catch (error) {
            console.log(error);
        }
    }
    else {
        res.redirect('/auth/login')
    }
})

module.exports = router