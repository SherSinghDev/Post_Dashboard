let multer = require('multer')

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `./src/assets/uploads/excelfiles`)
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

let upload = multer({ storage })

module.exports = upload