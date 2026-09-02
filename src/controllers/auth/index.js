let express = require('express')
let router = express.Router()
let User = require('../../modals/users')
let bcrypt = require("bcrypt")
let Users = require('../../modals/users')
let Doctor = require('../../modals/doctors')
const recruiters = require('../../modals/recruiters')
let patientOrder = require('../../modals/patientOrder')
const users = require('../../modals/users')
const supportAgent = require('../../modals/supportAgent')
const patientForm = require('../../modals/patientForm')

// login
router.get('/login', async (req, res) => {
    if (req.session.userId) {
        res.redirect('/')
    }
    else {
        res.render('login')
    }
})

router.post('/login', async (req, res) => {
    console.log(req.body);
    let { email, password } = req.body
    email = (email || '').trim().toLowerCase()
    let message;
    let loginType = 'user'
    let login = false
    try {
        if (email.startsWith('doctor')) {
            // console.log("I am Doctor");

            let prevUser = await Doctor.findOne({ email })
            if (prevUser) {
                // console.log(password, prevUser.password);

                let pass = await bcrypt.compare(password, prevUser.password)
                // console.log(pass);

                if (pass) {
                    login = true
                    message = "Login Successfully"
                    loginType = 'doctor'
                    req.session.userId = prevUser._id
                }
                else {
                    message = "Wrong Credentials"
                }
            }
            else {
                message = "User Does'nt Exists"
            }
        }
        else if (email.startsWith('job')) {
            // console.log("I am Doctor");

            let prevUser = await recruiters.findOne({ email })
            if (prevUser) {
                // console.log(password, prevUser.password);

                let pass = await bcrypt.compare(password, prevUser.password)
                // console.log(pass);

                if (pass) {
                    login = true
                    message = "Login Successfully"
                    loginType = 'recruiter'
                    req.session.userId = prevUser._id
                }
                else {
                    message = "Wrong Credentials"
                }
            }
            else {
                message = "User Does'nt Exists"
            }
        }
        else if (email.startsWith('support')) {
            console.log("I am agent");
            let prevUser = await supportAgent.findOne({ email })
            if (prevUser) {
                // console.log(password, prevUser.password);

                // let pass = await bcrypt.compare(password, prevUser.password)
                let pass = password == 'support@789'
                // console.log(pass);

                if (pass) {
                    login = true
                    message = "Login Successfully"
                    loginType = 'support agent'
                    req.session.agentId = prevUser._id
                }
                else {
                    message = "Wrong Credentials"
                }
            }
            else {
                message = "User Does'nt Exists"
            }
        }
        else {
            let prevUser = await User.findOne({ email })
            if (prevUser) {
                // console.log(password, prevUser.password);

                let pass = await bcrypt.compare(password, prevUser.password)
                // console.log(pass);
                // let pass = true
                if (pass) {
                    login = true
                    message = "Login Successfully"
                    req.session.userId = prevUser._id
                }
                else {
                    message = "Wrong Credentials"
                }
            }
            else {
                message = "User Does'nt Exists"
            }
        }

    } catch (error) {
        console.log(error);
        message = "Error in Server"
    }


    // async function getStatus() {
    //     let orders = await patientOrder.find()
    //     let awbs = orders.map(or => or.awb_number).join(',')
    //     async function authApi() {
    //         try {
    //             const loginResponse = await fetch("https://proship.prozo.com/api/auth/signin", {
    //                 method: 'POST',
    //                 headers: { "Content-Type": "application/json" },
    //                 body: JSON.stringify({
    //                     username: "ravikantkaushal23@gmail.com",
    //                     password: "qhmnGV"
    //                 })
    //             });

    //             const loginData = await loginResponse.json();
    //             return loginData

    //         } catch (error) {
    //             console.log(error);
    //             return null

    //         }
    //     }
    //     const loginData = await authApi()

    //     var myHeaders = new Headers();
    //     myHeaders.append("Authorization", `Bearer ${loginData.accessToken}`);

    //     var requestOptions = {
    //         method: 'GET',
    //         headers: myHeaders,
    //         redirect: 'follow'
    //     };

    //     let data = await fetch(`https://proship.prozo.com/api/order/track_waybill?waybills=${awbs}`, requestOptions)

    //     let results = await data.json()
    //     let changeArray = []

    //     if (results.waybillDetails) {
    //         let newOrders = orders.map((o) => {
    //             let track = results.waybillDetails.find(r => r.waybill == o.awb_number)

    //             changeArray.push({ awb_number: o.awb_number, orderStatus: track.currentStatus, statusDate: track.statusDate, patientId: o.patientId })
    //             return { ...o, track }
    //         })

    //     }
        
    //     await Promise.all(
    //         changeArray.map(async (or) => {
    //             // console.log(or.patientId,or.orderStatus);

    //             await patientForm.findOneAndUpdate(
    //                 { _id: or.patientId },
    //                 { 'otherStatus.deliveryStatus': or.orderStatus }
    //             );

    //             await patientOrder.findOneAndUpdate(
    //                 { awb_number: or.awb_number },
    //                 { orderStatus: or.orderStatus, statusDate: or.statusDate }
    //             );
    //         })
    //     );
    // }
    // await getStatus()
    // console.log(login);
    res.json({ login, loginType, message })
})


// register
router.get('/register', async (req, res) => {
    if (req.session.userId) {
        try {
            let user = await Users.findOne({ _id: req.session.userId })

            if (user.role !== 'Team Leader') {
                res.render('register', { user })
            }
            else {
                let referral = user.referralCode
                res.render('register', { user, referral })
            }

        } catch (error) {
            console.log(error);
        }
    }
    else {
        res.redirect('/auth/login')
    }

})

// router.post('/register', async (req, res) => {
//     let { email, password } = req.body
//     let message;
//     let created = false
//     try {
//         let isExists = await User.findOne({ email })
//         if (!isExists) {
//             let hashedPass = await bcrypt.hash(password, 10)
//             await User.create({ ...req.body, password: hashedPass })
//             message = "User Registered Successfully"
//             created = true
//         }
//         else {
//             message = "User Already Registered"
//         }
//     } catch (error) {
//         message = "Error in Server"
//         console.log(error);
//     }
//     res.json({ message, created })
// })



router.post("/register", async (req, res) => {
    if (req.session.userId) {
        try {
            console.log(req.body);

            const { name, email, mobile, password, role, district, } = req.body;

            // Check duplicate email
            const existingUser = await User.findOne({ email });
            if (existingUser)
                return res.status(400).json({ message: "Email already exists", created: false });

            // Encrypt password
            const hashedPassword = await bcrypt.hash(password, 10);

            const lastUser = await Users.findOne().sort({ createdAt: -1 }).select("userId")

            let nextNumber = 1;

            if (lastUser && lastUser.userId) {
                const lastNumber = parseInt(lastUser.userId);
                if (!isNaN(lastNumber)) nextNumber = lastNumber + 1;
            }

            // 🆔 Format the new register number (formType-XX)
            let userId = `${String(nextNumber).padStart(2, "0")}`;

            const user = new User({
                userId,
                name,
                email,
                password: hashedPassword,
                role,
                district,
                mobile
            });

            await user.save();

            res.status(201).json({
                message: "New Admin is created!",
                created: true
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error in server", created: false });
        }
    }
    else {
        res.redirect('/auth/login')
    }
});

router.post("/adminupdate/:id", async (req, res) => {
    if (req.session.userId) {
        try {
            console.log(req.body);

            let { password } = req.body;
            let prevUser = await Users.findOne().select("password")
            let hashedPassword;
            if (!password) {
                hashedPassword = prevUser.password
            }
            else {
                hashedPassword = await bcrypt.hash(password, 10);
            }


            // Encrypt password

            const edituser = await Users.updateOne({ _id: req.params.id }, { ...req.body, password: hashedPassword })



            res.status(201).json({
                message: "Admin is updated!",
                created: true
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error in server", created: false });
        }
    }
    else {
        res.redirect('/auth/login')
    }

});

// logout
router.post('/logout', async (req, res) => {
    req.session.userId = ''
    res.json({ logout: true })
})

router.post('/logout/agent', async (req, res) => {
    req.session.agentId = ''
    res.json({ logout: true })
})


module.exports = router