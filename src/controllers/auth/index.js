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

router.post('/register', async (req, res) => {
    let { email, password } = req.body
    let message;
    let created = false
    try {
        let isExists = await User.findOne({ email })
        if (!isExists) {
            let hashedPass = await bcrypt.hash(password, 10)
            await User.create({ ...req.body, password: hashedPass })
            message = "User Registered Successfully"
            created = true
        }
        else {
            message = "User Already Registered"
        }
    } catch (error) {
        message = "Error in Server"
        console.log(error);
    }
    res.json({ message, created })
})

// logout
router.post('/logout', async (req, res) => {
    req.session.userId = ''
    res.json({ logout: true })
})



module.exports = router