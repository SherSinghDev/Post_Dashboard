let express = require('express')
let router = express.Router()
let Users = require('../../modals/users')



router.get('/', async (req, res) => {
    if (req.session.userId) {
        try {
            let users = await Users.find()
            res.render('users', { users,page:"Users" })
        } catch (error) {
            console.log(error);
            res.redirect('/auth/login')
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
            tr = `#tr-${id}`
            res.json({ deleted, tr })
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
    await Patient.updateOne({ _id: id }, req.body)
    let patient1 = await Patient.findOne({ _id: id })
    console.log(patient1);
    let tdHtml = `<span>${patient1.trackingId}</span>`
    let td = `#td-${id}`
    res.json({ message: "Updated Successfully", td, tdHtml, updated: true })
})



module.exports = router