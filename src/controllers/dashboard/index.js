let express = require('express')
let router = express.Router()
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
        let patients = (await PatientForm.find({ "otherStatus.doctorStatus": { $in: [null, ""] }, "otherStatus.supportStatus": { $in: [null, "", undefined] } })).length
        let pendingpatients = (await PatientForm.find({
            "otherStatus.doctorStatus": { $in: [null, ""] },
            "otherStatus.supportStatus": { $nin: [null, ""] },
            "otherStatus.trackingIdStatus": { $in: [null, ""] },
            "otherStatus.deliveryStatus": { $nin: ["delivered", "Delivered", "DELIVERED"] }
        })).length
        let varifiedPatients = (await PatientForm.find({
            "otherStatus.doctorStatus": { $nin: [null, ""] },
            "otherStatus.trackingIdStatus": { $in: [null, ""] },
            "otherStatus.deliveryStatus": { $nin: ["delivered", "Delivered", "DELIVERED"] }
        })).length
        let patientsOrders = (await PatientForm.find({
            // "otherStatus.doctorStatus": { $nin: [null, ""] },
            "otherStatus.trackingIdStatus": { $nin: [null, ""] },
            "otherStatus.deliveryStatus": { $nin: ["delivered", "Delivered", "DELIVERED"] }
        })).length
        let deliveredOrders = (await PatientForm.find({
            "otherStatus.deliveryStatus": { $in: ["delivered", "Delivered", "DELIVERED"] }
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

        res.render('index', { user, page: "Dashboard", verified, unverified, patients, varifiedPatients, patientsOrders, deliveredOrders,pendingpatients })
    }
    else {
        res.redirect('/auth/login')
    }
})


module.exports = router