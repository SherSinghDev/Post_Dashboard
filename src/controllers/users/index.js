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






router.get('/', async (req, res) => {
    if (req.session.userId) {
        try {
            let user = await Users.findOne({ _id: req.session.userId })

            if (user.type === 'stockorder') {
                return res.redirect('/users/network');
            }

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
            const profilePicture = req.body.remove_profilePicture ? null : (req.files['profilePicture'] ? `/uploads/documents/${req.files['profilePicture'][0].filename}` : appUser.profilePicture);
            const idDocument = req.body.remove_idDocument ? null : (req.files['idDocument'] ? `/uploads/documents/${req.files['idDocument'][0].filename}` : appUser.idDocument);
            const otherDocument = req.body.remove_otherDocument ? null : (req.files['otherDocument'] ? `/uploads/documents/${req.files['otherDocument'][0].filename}` : appUser.otherDocument);
            const receiptUrl = req.body.remove_receiptUrl ? null : (req.files['receiptUrl'] ? `/uploads/documents/${req.files['receiptUrl'][0].filename}` : appUser.receiptUrl);



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

// ==========================================
// 5-LEVEL USER NETWORK (STOCK ORDER MEMBERS)
// ==========================================

// Helper: Traverse 5 Levels of Descendant/Child Users
async function getFiveLevelNetwork(currentUser) {
    let networkByLevel = {
        1: [],
        2: [],
        3: [],
        4: [],
        5: []
    };
    let allLevelUsers = [];
    let visitedUserIds = new Set();
    visitedUserIds.add(currentUser._id.toString());

    // --- LEVEL 1 (Direct Children) ---
    // Can be linked by parentUser OR referredBy
    const l1Conditions = [{ parentUser: currentUser._id }];
    if (currentUser.userId) {
        l1Conditions.push({ referredBy: currentUser.userId });
    }
    if (currentUser.referralCode) {
        l1Conditions.push({ referredBy: currentUser.referralCode });
    }

    let l1Docs = await Users.find({
        _id: { $ne: currentUser._id },
        $or: l1Conditions
    }).lean();

    // Deduplicate & populate parent info
    let l1ParentMap = new Map();
    for (let u of l1Docs) {
        const uIdStr = u._id.toString();
        if (!visitedUserIds.has(uIdStr)) {
            visitedUserIds.add(uIdStr);
            u.level = 1;
            u.parentName = currentUser.name || 'Direct';
            u.parentDisplayId = currentUser.userId || '';
            networkByLevel[1].push(u);
            allLevelUsers.push(u);
            l1ParentMap.set(uIdStr, u);
        }
    }

    // --- LEVELS 2 to 5 ---
    let prevLevelUsers = networkByLevel[1];

    for (let level = 2; level <= 5; level++) {
        if (prevLevelUsers.length === 0) break;

        let prevIds = prevLevelUsers.map(u => u._id);
        let prevUserIds = prevLevelUsers.map(u => u.userId).filter(Boolean);
        let prevRefCodes = prevLevelUsers.map(u => u.referralCode).filter(Boolean);

        let levelConditions = [{ parentUser: { $in: prevIds } }];
        if (prevUserIds.length > 0) {
            levelConditions.push({ referredBy: { $in: prevUserIds } });
        }
        if (prevRefCodes.length > 0) {
            levelConditions.push({ referredBy: { $in: prevRefCodes } });
        }

        let currDocs = await Users.find({
            _id: { $nin: Array.from(visitedUserIds).map(id => new mongoose.Types.ObjectId(id)) },
            $or: levelConditions
        }).lean();

        let currentLevelList = [];
        for (let u of currDocs) {
            const uIdStr = u._id.toString();
            if (!visitedUserIds.has(uIdStr)) {
                visitedUserIds.add(uIdStr);
                u.level = level;

                // Identify parent name & ID from previous level
                let parentUserRef = prevLevelUsers.find(p => 
                    (u.parentUser && p._id.toString() === u.parentUser.toString()) ||
                    (u.referredBy && (p.userId === u.referredBy || p.referralCode === u.referredBy))
                );

                u.parentName = parentUserRef ? parentUserRef.name : 'N/A';
                u.parentDisplayId = parentUserRef ? (parentUserRef.userId || '') : '';

                // For privacy protection on Level 2-5:
                // Only User Name, Address (Village, Block, District/City, State, FullAddress), and Joining Date are allowed.
                // Sensitive fields (mobile, email, documents, password, etc.) are stripped or masked.
                u.isMasked = true;
                u.maskedMobile = u.mobile ? u.mobile.slice(0, 2) + '******' + u.mobile.slice(-2) : 'Protected';
                u.maskedEmail = u.email ? u.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'Protected';

                currentLevelList.push(u);
                networkByLevel[level].push(u);
                allLevelUsers.push(u);
            }
        }
        prevLevelUsers = currentLevelList;
    }

    return {
        networkByLevel,
        allLevelUsers,
        counts: {
            total: allLevelUsers.length,
            l1: networkByLevel[1].length,
            l2: networkByLevel[2].length,
            l3: networkByLevel[3].length,
            l4: networkByLevel[4].length,
            l5: networkByLevel[5].length,
        }
    };
}

// Route: View 5-Level Network Dashboard
router.get('/network', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }

    try {
        let user = await Users.findOne({ _id: req.session.userId });
        if (!user) {
            return res.redirect('/auth/login');
        }

        const networkData = await getFiveLevelNetwork(user);

        res.render('stockOrder/network', {
            user,
            page: "5-Level Member Network",
            allLevelUsers: networkData.allLevelUsers,
            networkByLevel: networkData.networkByLevel,
            counts: networkData.counts
        });
    } catch (error) {
        console.error("Error loading network dashboard:", error);
        res.status(500).send("Error loading member network.");
    }
});

// Route: Get Single Member Details (Enforces Level 1 full details vs Level 2-5 privacy masking)
router.get('/network/details/:id', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        let currentUser = await Users.findOne({ _id: req.session.userId });
        if (!currentUser) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        // Check if Admin
        if (currentUser.role === 'Admin') {
            let targetUser = await Users.findOne({ _id: req.params.id }).populate('parentUser');
            return res.json({ success: true, user: targetUser, level: 1, fullAccess: true });
        }

        const networkData = await getFiveLevelNetwork(currentUser);
        const member = networkData.allLevelUsers.find(u => u._id.toString() === req.params.id);

        if (!member) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this user. They are not in your 5-level network."
            });
        }

        if (member.level === 1) {
            // Full details for Level 1
            return res.json({
                success: true,
                user: member,
                level: 1,
                fullAccess: true
            });
        } else {
            // Limited details for Level 2-5: Name, Address, Joining Date
            return res.json({
                success: true,
                user: {
                    _id: member._id,
                    name: member.name,
                    fullAddress: member.fullAddress,
                    village: member.village,
                    block: member.block,
                    district: member.district,
                    state: member.state,
                    pinCode: member.pinCode,
                    createdAt: member.createdAt,
                    position: member.position,
                    parentName: member.parentName,
                    parentDisplayId: member.parentDisplayId,
                    level: member.level
                },
                level: member.level,
                fullAccess: false
            });
        }
    } catch (error) {
        console.error("Error fetching network user details:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;