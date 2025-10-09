let express = require('express')
let router = express.Router()
let Patient = require('../../modals/patients')
let upload = require('../../multer')
let XLSX = require("xlsx")

router.get('/', async (req, res) => {
    if (req.session.userId) {
        try {

            let patients = await Patient.find()
            res.render('patients', { patients })
        } catch (error) {
            console.log(error);
            res.redirect('/auth/login')
        }
    }
    else {
        res.redirect('/auth/login')
    }
})

// create
router.post('/create', upload.single('myfile'), async (req, res) => {
    console.log(req.body);
    console.log(req.file);
    let file = req.file

    try {
        const workbook = XLSX.readFile(file.path); // or .xlsx
        const sheetName = workbook.SheetNames[0]; // get first sheet
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const mappedData = sheetData.map(row => ({
            idNo: row['ID No.'],
            name: row["NAME"],
            fatherName: row["FATHER NAME"],
            gender: row["GENDER"],
            mobileNo: row['MOBILE NO.'],
            email: row['EMAIL'],
            city: row["CITY"],
            state: row["STATE"],
            address: row["ADDRESS"],
            status: row["STATUS"],
            authority: row["AUTHORITY"],
            trackingId: `TRK-${Math.floor(100000 + Math.random() * 900000)}` // default tracking ID
        }));
        // console.log(mappedData);
        await Patient.deleteMany();
        let patients = await Patient.insertMany(mappedData)
        console.log(patients);
        res.json({ created: true })
    } catch (error) {
        console.log(error);
        res.json({ created: false, message: "Error in Server" })

    }

})

// delete
router.delete('/delete/:id', async (req, res) => {
    let { id } = req.params
    let deleted = false
    try {
        let del = await Patient.deleteOne({ _id: id })
        console.log(del);
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
    // console.log(req.body);

    try {
        await Patient.updateOne({ _id: id }, {
            deliveryStatus: req.body.status,
            trackingId: req.body.trackingId
        })
        let patient1 = await Patient.findOne({ _id: id })
        // console.log(patient1);
        let tdHtml = `<span>${patient1.trackingId}</span>`
        let td = `#td-${id}`

        let classed;
        if (patient1.deliveryStatus == 'Delivered') {
            classed = 'success'
        }

        if (patient1.deliveryStatus == 'On Delivery') {
            classed = 'primary'
        }

        if (patient1.deliveryStatus == 'Canceled') {
            classed = 'danger'
        }



        let statusSpan = `#status-${id}`
        let status = `<span
                        class="badge badge-rounded badge-outline-${classed} badge-lg">
						${patient1.deliveryStatus}
						</span>`
        res.json({ message: "Updated Successfully", td, tdHtml, statusSpan, status, updated: true })
    } catch (error) {
        console.log(error);
        res.json({ message: "Error in Server", updated: false })
    }
})



module.exports = router