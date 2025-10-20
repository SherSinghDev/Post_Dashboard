let express = require('express')
let router = express.Router()
let Users = require('../../modals/users')



router.get('/', async (req, res) => {
    if (req.session.userId) {
        try {
            let user = await Users.findOne({ _id: req.session.userId })

            if (user.role !== 'Admin') {
                res.redirect('/')
            }
            else {
                let users = await Users.find().sort({ createdAt: -1 })
                // console.log(users);
                res.render('users', { users, user, page: "Users" })
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
            res.render('idcard', { user})

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
    console.log(id);
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
router.post('/update/:id', async (req, res) => {
    let { id } = req.params
    await Users.updateOne({ _id: id }, req.body)
    let patient1 = await Users.findOne({ _id: id })
    console.log(patient1);
    let tdHtml = `<span>${patient1.trackingId}</span>`
    let td = `#td-${id}`
    res.json({ message: "Updated Successfully", td, tdHtml, updated: true })
})



router.get('/userprofile/:id', async (req, res) => {
    if (req.session.userId) {
        let { id } = req.params
        try {
            let user = await Users.findOne({ _id: id })
            // console.log(user);
            let refCode = user.referralCode
            let coord = await Users.find({ referredBy: refCode })
            // console.log(coord);

            res.render('profileDetails', { page: "User Details", user, coord })
        } catch (error) {
            console.log(error);
            res.redirect('/auth/login')
        }
    }
    else {
        res.redirect('/auth/login')
    }

})


router.get('/coordinators', async(req, res) => {
    if (req.session.userId) {
        try {
            let user = await Users.findOne({ _id: req.session.userId })

            if (user.role !== 'Team Leader') {
                res.redirect('/')
            }
            else {
                let users = await Users.find({role:"Coordinator",referredBy:user.referralCode})
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