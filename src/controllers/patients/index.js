let express = require('express')
let router = express.Router()
let Patient = require('../../modals/patients')
let Orders = require('../../modals/orders')
let upload = require('../../multer')
let XLSX = require("xlsx")

router.get('/', async (req, res) => {
    if (req.session.userId) {
        try {
            let patients = await Orders.find()
            res.render('patients', { patients,page:"Patient Orders" })
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
// router.post('/create', upload.single('myfile'), async (req, res) => {
//     console.log(req.body);
//     console.log(req.file);
//     let file = req.file

//     try {
//         const workbook = XLSX.readFile(file.path); // or .xlsx
//         const sheetName = workbook.SheetNames[0]; // get first sheet
//         const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

//         const mappedData = sheetData.map(row => ({
//             idNo: row['ID No.'],
//             name: row["NAME"],
//             fatherName: row["FATHER NAME"],
//             gender: row["GENDER"],
//             mobileNo: row['MOBILE NO.'],
//             email: row['EMAIL'],
//             city: row["CITY"],
//             state: row["STATE"],
//             address: row["ADDRESS"],
//             status: row["STATUS"],
//             authority: row["AUTHORITY"],
//             trackingId: `TRK-${Math.floor(100000 + Math.random() * 900000)}` // default tracking ID
//         }));
//         // console.log(mappedData);
//         await Patient.deleteMany();
//         let patients = await Patient.insertMany(mappedData)
//         console.log(patients);
//         res.json({ created: true })
//     } catch (error) {
//         console.log(error);
//         res.json({ created: false, message: "Error in Server" })

//     }

// })


router.post('/create', upload.single('myfile'), async (req, res) => {
    console.log(req.body);
    console.log(req.file);
    let file = req.file

    try {
        const workbook = XLSX.readFile(file.path); // or .xlsx
        const sheetName = workbook.SheetNames[0]; // get first sheet
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log(`📦 Found ${sheetData.length} records in Excel.`);

        const mappedData = sheetData.map((row) => ({
            serialNumber: row["SERIAL NUMBER"],
            barcodeNo: row["BARCODE NO"],
            physicalWeight: row["PHYSICAL WEIGHT"],
            receiver: {
                name: row["RECEIVER NAME"],
                addressLine1: row["RECEIVER ADD LINE 1"],
                addressLine2: row["RECEIVER ADD LINE 2"],
                addressLine3: row["RECEIVER ADD LINE 3"],
                city: row["RECEIVER CITY"],
                pincode: row["RECEIVER PINCODE"],
                stateUT: row["RECEIVER STATE/UT"],
                contact: row["RECEIVER CONTACT"],
                altContact: row["RECEIVER ALT CONTACT"],
                email: row["RECEIVER EMAILID"],
                kyc: row["RECEIVER KYC"],
                taxRef: row["RECEIVER TAX REF"],
            },
            parcelDetails: {
                ack: row["ACK"] === true || row["ACK"] === "true",
                altAddressFlag:
                    row["ALT ADDRESS FLAG"] === true ||
                    row["ALT ADDRESS FLAG"] === "true",
                bulkReference: row["BULK REFERENCE"],
                trackingId: row["BARCODE NO"],
            },
            sender: {
                addressLine1: row["SENDER ADD LINE 1"],
                addressLine2: row["SENDER ADD LINE 2"],
                addressLine3: row["SENDER ADD LINE 3"],
            },
        }));
        // console.log(mappedData);
        await Orders.deleteMany();
        let orders = await Orders.insertMany(mappedData)
        console.log(orders);
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
        let del = await Orders.deleteOne({ _id: id })
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
        await Orders.updateOne({ _id: id }, {
            parcelDetails:{
                deliveryStatus: req.body.status,
                trackingId: req.body.trackingId
            }
        })
        let patient1 = await Orders.findOne({ _id: id })
        // console.log(patient1);
        let tdHtml = `<span>${patient1.parcelDetails.trackingId}</span>`
        let td = `#td-${id}`

        let classed;
        if (patient1.parcelDetails.deliveryStatus == 'Delivered') {
            classed = 'success'
        }

        if (patient1.parcelDetails.deliveryStatus == 'On Delivery') {
            classed = 'primary'
        }

        if (patient1.parcelDetails.deliveryStatus == 'Canceled') {
            classed = 'danger'
        }



        let statusSpan = `#status-${id}`
        let status = `<span
                        class="badge badge-rounded badge-outline-${classed} badge-lg">
						${patient1.parcelDetails.deliveryStatus}
						</span>`
        res.json({ message: "Updated Successfully", td, tdHtml, statusSpan, status, updated: true })
    } catch (error) {
        console.log(error);
        res.json({ message: "Error in Server", updated: false })
    }
})



module.exports = router