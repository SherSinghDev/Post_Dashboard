let express = require('express')
let router = express.Router()
let User = require('../../modals/users')
let bcrypt = require("bcrypt")

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
    let message;
    let login = false
    try {
        let prevUser = await User.findOne({ email })
        if (prevUser) {
            console.log(password, prevUser.password);

            let pass = await bcrypt.compare(password, prevUser.password)
            console.log(pass);

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
    } catch (error) {
        console.log(error);
        message = "Error in Server"
    }

    res.json({ login, message })
})


// register
router.get('/register', async (req, res) => {
    if (req.session.userId) {
        res.render('register')
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
    try {
        const { username, email, password, role,city, referredBy } = req.body;

        // Check duplicate email
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "Email already exists", created: false });

        // Encrypt password
        const hashedPassword = await bcrypt.hash(password, 10);

        let teamLeaderId = null;
        let finalReferredBy = null;

        if (role === "Coordinator") {
            // Must have a valid team leader referral
            const leader = await User.findOne({ referralCode: referredBy });
            if (!leader || leader.role !== "Team Leader") {
                return res.status(400).json({ message: "Invalid referral code", created: false });
            }
            teamLeaderId = leader._id;
            finalReferredBy = leader.referralCode;
        }

        const user = new User({
            name: username,
            email,
            password: hashedPassword,
            role,
            city,
            teamLeaderId,
            referredBy: finalReferredBy,
        });

        await user.save();

        res.status(201).json({
            message:
                role === "Team Leader"
                    ? "Team Leader registered successfully"
                    : "Coordinator registered successfully",
            //   referralCode: user.referralCode,
            created: true
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({ message: "Error in server", created: false });
    }
});

// logout
router.post('/logout', async (req, res) => {
    req.session.userId = ''
    res.json({ logout: true })
})



module.exports = router