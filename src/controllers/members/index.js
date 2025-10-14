let express = require('express')
let router = express.Router()



router.get('/', async (req, res) => {
    res.render('memberform')
})


module.exports = router