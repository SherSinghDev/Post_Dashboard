let express = require('express')
let router = express.Router()
let mongoose = require('mongoose')
let Patient = require('../../modals/patients')
let Users = require('../../modals/users')
let Orders = require('../../modals/orders')
const UserApplication = require('../../modals/applications');
const PatientForm = require('../../modals/patientForm'); // adjust path as needed






router.get('/', async (req, res) => {
    console.log(req.session);
    if (req.session.userId) {
        let verified = (await Users.find({ role: "Coordinator" })).length
        let unverified = (await UserApplication.find({ approveStatus: "Pending" })).length
        let patients = (await PatientForm.find({ "otherStatus.doctorStatus": { $in: [null, ""] }, "otherStatus.supportStatus": { $in: [null, "", undefined] }, type: { $ne: "stockorder" } })).length
        let pendingpatients = (await PatientForm.find({
            "otherStatus.doctorStatus": { $in: [null, ""] },
            "otherStatus.supportStatus": { $nin: [null, ""] },
            "otherStatus.trackingIdStatus": { $in: [null, ""] },
            "otherStatus.deliveryStatus": { $nin: ["delivered", "Delivered", "DELIVERED"] },
            type: { $ne: "stockorder" }
        })).length
        let varifiedPatients = (await PatientForm.find({
            "otherStatus.doctorStatus": { $nin: [null, ""] },
            "otherStatus.trackingIdStatus": { $in: [null, ""] },
            "otherStatus.deliveryStatus": { $nin: ["delivered", "Delivered", "DELIVERED"] },
            type: { $ne: "stockorder" }
        })).length
        let patientsOrders = (await PatientForm.find({
            // "otherStatus.doctorStatus": { $nin: [null, ""] },
            "otherStatus.trackingIdStatus": { $nin: [null, ""] },
            "otherStatus.deliveryStatus": { $nin: ["delivered", "Delivered", "DELIVERED"] },
            type: { $ne: "stockorder" }
        })).length
        let deliveredOrders = (await PatientForm.find({
            "otherStatus.deliveryStatus": { $in: ["delivered", "Delivered", "DELIVERED"] },
            type: { $ne: "stockorder" }
        })).length

        let user = await Users.findOne({ _id: req.session.userId })

        if (user.role == 'Coordinator') {
            verified = (await Users.find({ referredBy: user.userId })).length
            patients = (await PatientForm.find({ referredBy: user.userId, "otherStatus.doctorStatus": { $in: [null, ""] }, "otherStatus.supportStatus": { $in: [null, "", undefined] } })).length
            varifiedPatients = (await PatientForm.find({
                referredBy: user.userId,
                "otherStatus.doctorStatus": { $nin: [null, ""] },
                "otherStatus.trackingIdStatus": { $in: [null, ""] },
                "otherStatus.deliveryStatus": { $nin: ["delivered", "Delivered", "DELIVERED"] }
            })).length
            pendingpatients = (await PatientForm.find({
                referredBy: user.userId,
                "otherStatus.doctorStatus": { $in: [null, ""] },
                "otherStatus.supportStatus": { $nin: [null, ""] },
                "otherStatus.trackingIdStatus": { $in: [null, ""] },
                "otherStatus.deliveryStatus": { $nin: ["delivered", "Delivered", "DELIVERED"] }
            })).length
            patientsOrders = (await PatientForm.find({
                referredBy: user.userId,
                // "otherStatus.doctorStatus": { $nin: [null, ""] },
                "otherStatus.trackingIdStatus": { $nin: [null, ""] },
                "otherStatus.deliveryStatus": { $nin: ["delivered", "Delivered", "DELIVERED"] }
            })).length
            deliveredOrders = (await PatientForm.find({
                referredBy: user.userId,
                "otherStatus.deliveryStatus": { $in: ["delivered", "Delivered", "DELIVERED"] }
            })).length
            unverified = (await UserApplication.find({ approveStatus: "Pending", referredBy: user.userId })).length
        }

        let networkCounts = { total: 0, l1: 0 };
        if (user.type === 'stockorder') {
            const l1Conditions = [{ parentUser: user._id }];
            if (user.userId) l1Conditions.push({ referredBy: user.userId });
            if (user.referralCode) l1Conditions.push({ referredBy: user.referralCode });

            let l1Docs = await Users.find({
                _id: { $ne: user._id },
                $or: l1Conditions
            }).select('_id userId referralCode');

            let visitedIds = new Set([user._id.toString()]);
            let l1Ids = [];
            l1Docs.forEach(u => {
                const idStr = u._id.toString();
                if (!visitedIds.has(idStr)) {
                    visitedIds.add(idStr);
                    l1Ids.push(u);
                }
            });

            networkCounts.l1 = l1Ids.length;
            let totalNetwork = l1Ids.length;
            let prevLevelUsers = l1Ids;

            for (let lvl = 2; lvl <= 5; lvl++) {
                if (prevLevelUsers.length === 0) break;
                let prevObjIds = prevLevelUsers.map(u => u._id);
                let prevUIds = prevLevelUsers.map(u => u.userId).filter(Boolean);
                let prevRCodes = prevLevelUsers.map(u => u.referralCode).filter(Boolean);

                let conditions = [{ parentUser: { $in: prevObjIds } }];
                if (prevUIds.length > 0) conditions.push({ referredBy: { $in: prevUIds } });
                if (prevRCodes.length > 0) conditions.push({ referredBy: { $in: prevRCodes } });

                let currDocs = await Users.find({
                    _id: { $nin: Array.from(visitedIds).map(id => new mongoose.Types.ObjectId(id)) },
                    $or: conditions
                }).select('_id userId referralCode');

                let nextLevel = [];
                currDocs.forEach(u => {
                    const idStr = u._id.toString();
                    if (!visitedIds.has(idStr)) {
                        visitedIds.add(idStr);
                        nextLevel.push(u);
                    }
                });

                totalNetwork += nextLevel.length;
                prevLevelUsers = nextLevel;
            }
            networkCounts.total = totalNetwork;
        }

        let showStockOrderNotice = false;
        if (user.type === 'stockorder' && req.session.showStockOrderNotice) {
            showStockOrderNotice = true;
            req.session.showStockOrderNotice = false;
        }

        res.render('index', {
            user,
            page: "Dashboard",
            verified,
            unverified,
            patients,
            varifiedPatients,
            patientsOrders,
            deliveredOrders,
            pendingpatients,
            networkCounts,
            showStockOrderNotice,
            platformWalletAmount: user.platformWalletAmount || 0
        });
    }
    else {
        res.redirect('/home')
    }
})

router.get('/aboutus', async (req, res) => {
    let user = null;
    if (req.session.userId) {
        const Users = require('../../modals/users');
        user = await Users.findOne({ _id: req.session.userId });
        if (!user) {
            const Doctor = require('../../modals/doctors');
            user = await Doctor.findOne({ _id: req.session.userId });
        }
    }
    res.render('aboutus', { user, page: "About Us" });
})


module.exports = router