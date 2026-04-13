let express = require('express')
let app = express()
let mongoConnect = require('./modals/db')
let patientRouter = require('./controllers/patients/index')
let dashboardRouter = require('./controllers/dashboard/index')
let authRouter = require('./controllers/auth/index')
let userRouter = require('./controllers/users/index')
let applicationsRouter = require('./controllers/application/index')
let patientFormRouter = require('./controllers/patientForm/index')
let patientOrderRouter = require('./controllers/patientOrder/index')
let jobsRouter = require('./controllers/jobs/index')
let doctorsRouter = require('./controllers/doctors/index')
let supportRouter = require('./controllers/support/index')
let stockRouter = require('./controllers/stock/index')
let teleconsultRouter = require('./controllers/teleconsultBooking/index')
let session = require("express-session")
let cors = require('cors')
const patientOrder = require('./modals/patientOrder')
const patientForm = require('./modals/patientForm')


// mongodb
mongoConnect()


// middlewares
app.use(express.static('./src/assets'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(session({
  secret: "^*&*(",
  resave: false,
  saveUninitialized: false
}))

app.use(cors({
  origin: '*'
}))


// setting ejs
app.set('view engine', 'ejs')
app.set('views', './src/views')



// routes
// app.get('/home', (req, res) => {
//     res.render('home')
// })
app.use('/patients', patientRouter)
app.use('/', dashboardRouter)
app.use('/auth', authRouter)
app.use('/users', userRouter)
app.use('/applications', applicationsRouter)
app.use('/patientform', patientFormRouter)
app.use('/patientorder', patientOrderRouter)
app.use('/doctors', doctorsRouter)
app.use('/jobs', jobsRouter)
app.use('/support', supportRouter)
app.use('/stock', stockRouter)
app.use('/teleconsult', teleconsultRouter)
app.get('/id', (req, res) => {
  res.render('idcard')
})


// {
// orderStatusCode: 5,
// orderStatusEnum: 'INTRANSIT',
// orderStatusDescription: 'In Transit',
// orderSubStatusCode: 0,
// orderSubStatusEnum: 'NOT_APPLICABLE',
// currentLocation: '',
// courierPartnerId: 212,
// remark: 'ArrivedAtCarrierFacility - UnableToContactRecipient - DeliveryAttempted',
// isRvp: false,
// courierPartnerEdd: '2026-02-02T00:00:00.000Z',
// ndrStatusCode: null,
// ndrStatusDescription: null,
// nprStatusCode: null,
// nprStatusDescription: null,
// timestamp: '2026-02-02T08:21:49.000Z',
// creationDate: '2026-02-02T08:22:08.612Z',
// waybill: '366881116033',
// courierPartnerEdd_dateStr: '2026-02-02',
// courierPartnerName: 'ATS (Amazon Transportation Services)',
// edd: '2026-02-02T08:56:37.000Z',
// merchantZone: 'REGIONAL',
// reference: '6974d6ec037825906e7ef12c',
// deliveryOtpSent: null,
// manuallyUpdatedBy: null,
// forwardQCImages: null,
// reverseQCImages: null
//}
//{
// connection: 'upgrade',
// host: 'bsrfindia.com',
// 'content-length': '835',
// accept: 'application/json, text/plain, */*',
// 'content-type': 'application/json',
// 'user-agent': 'axios/1.7.9',
// 'accept-encoding': 'gzip, compress, deflate, br'
//}

app.post('/api/webhooks/proship', async (req, res) => {
  try {
    console.log('--- ProShip Webhook Received ---');
    console.log('Headers:', JSON.stringify(req.headers['content-type']));
    console.log('Full Body:', JSON.stringify(req.body, null, 2));
    console.log('AWB field (waybill):', req.body.waybill);
    console.log('AWB field (awb_number):', req.body.awb_number);
    console.log('AWB field (awb):', req.body.awb);

    // Determine the correct AWB field - adjust based on actual payload
    let awbValue = req.body.waybill || req.body.awb_number || req.body.awb || req.body.tracking_number;
    console.log('Resolved AWB value:', awbValue);

    if (!awbValue) {
      console.log('ERROR: No AWB number found in webhook payload. Available keys:', Object.keys(req.body));
      return res.json({ success: false, error: 'No AWB number in payload' });
    }

    let order = await patientOrder.findOneAndUpdate({ awb_number: awbValue }, {
      orderStatus: req.body.orderStatusEnum,
      statusDate: req.body.timestamp,
      'courier_id.name': req.body.courierPartnerName,
      'courier_id.parent': req.body.courierPartnerName,
    })

    let status = req.body.orderStatusDescription
    let deliveryPartner = req.body.courierPartnerName

    let patient;
    if (order) {
      console.log('Order found! Order ID:', order._id, 'PatientId:', order.patientId);
      // let patient = await patientForm.findOne({ _id: order.patientId }).select('patientName mobileNumber')
      patient = await patientForm.findOneAndUpdate(
        { _id: order.patientId },
        { 'otherStatus.deliveryStatus': req.body.orderStatusEnum }
      ).select('patientName mobileNumber');
    } else {
      console.log('ERROR: No order found with awb_number:', awbValue);
    }


    console.log(status);
    console.log(order);
    console.log(patient);
    // console.log(status, deliveryPartner, patient);

    if (order && patient) {
      let mainStatus = status.toLowerCase()
      let tmpId;
      let vars = [patient.patientName, order._id, order.awb_number, 'https://www.google.com']
      if (mainStatus.includes('transit')) {
        tmpId = '907900041733412'
      }
      else if (mainStatus.includes('out for delivery')) {
        tmpId = '1444085863745042'
      }
      else if (mainStatus.includes('delivered')) {
        tmpId = '2717556531914471'
        vars = [patient.patientName, order._id]
      }
      else if (mainStatus.includes('dispatch')) {
        tmpId = '2226838111392141'
      }


      const payload = {
        sender: "917417271707",
        to: `+91${patient.mobileNumber}`,
        templateId: tmpId,

        // If template has header
        //   headerVariables: ["https://bol7.com/logo.png"],

        bodyVariables: vars,

        // If template has button
        //   buttonVariables: ["Verify Now"],
      };

      const response = await fetch(
        "https://chat.bol7.com/api/whatsapp/SendTemplate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      console.log("Bol7 Response:", data);

    }
    res.json({ success: true })
  } catch (error) {
    console.log(error);
    res.json({ success: false })
  }
})

app.get('/api/webhooks/proship', (req, res) => {
  res.json({ success: true })
})


app.post('/api/webhooks/smartship', async (req, res) => {
  try {
    console.log('--- SmartShip Webhook Received ---');
    console.log('Headers:', JSON.stringify(req.headers['content-type']));
    console.log('Full Body:', JSON.stringify(req.body, null, 2));
    console.log('AWB field (awbno):', req.body.awbno);
    console.log('AWB field (awb_number):', req.body.awb_number);
    console.log('AWB field (awb):', req.body.awb);

    // Determine the correct AWB field - adjust based on actual payload
    let awbValue = req.body.awbno || req.body.awb_number || req.body.awb || req.body.tracking_number;
    console.log('Resolved AWB value:', awbValue);

    if (!awbValue) {
      console.log('ERROR: No AWB number found in webhook payload. Available keys:', Object.keys(req.body));
      return res.json({ success: false, error: 'No AWB number in payload' });
    }

    let order = await patientOrder.findOneAndUpdate({ awb_number: awbValue }, {
      orderStatus: req.body.status_description,
      statusDate: req.body.statusUpdateDate,
      // 'courier_id.name': req.body.courierPartnerName,
      // 'courier_id.parent': req.body.courierPartnerName,
    })

    let status = req.body.status_description
    // let deliveryPartner = req.body.courierPartnerName

    let patient;
    if (order) {
      console.log('Order found! Order ID:', order._id, 'PatientId:', order.patientId);
      // let patient = await patientForm.findOne({ _id: order.patientId }).select('patientName mobileNumber')
      patient = await patientForm.findOneAndUpdate(
        { _id: order.patientId },
        { 'otherStatus.deliveryStatus': req.body.status_description }
      ).select('patientName mobileNumber');
    } else {
      console.log('ERROR: No order found with awb_number:', awbValue);
    }


    console.log(status);
    console.log(order);
    console.log(patient);
    // console.log(status, deliveryPartner, patient);

    if (order && patient) {
      let mainStatus = status.toLowerCase()
      let tmpId;
      let vars = [patient.patientName, order._id, order.awb_number, 'https://www.google.com']
      if (mainStatus.includes('transit')) {
        tmpId = '907900041733412'
      }
      else if (mainStatus.includes('out for delivery')) {
        tmpId = '1444085863745042'
      }
      else if (mainStatus.includes('delivered')) {
        tmpId = '2717556531914471'
        vars = [patient.patientName, order._id]
      }
      else if (mainStatus.includes('dispatch')) {
        tmpId = '2226838111392141'
      }


      const payload = {
        sender: "917417271707",
        to: `+91${patient.mobileNumber}`,
        templateId: tmpId,

        // If template has header
        //   headerVariables: ["https://bol7.com/logo.png"],

        bodyVariables: vars,

        // If template has button
        //   buttonVariables: ["Verify Now"],
      };

      const response = await fetch(
        "https://chat.bol7.com/api/whatsapp/SendTemplate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      console.log("Bol7 Response:", data);

    }
    res.json({
      "data": {
        "message": {
          "success": true,
          "description": "response message"
        }
      }
    })
  } catch (error) {
    console.log(error);
    res.json({ success: false })
  }
})


app.get("/send", async (req, res) => {
  try {
    const payload = {
      sender: "917417271707",
      to: "+916399663790",
      templateId: "2319899531822263",

      // If template has header
      //   headerVariables: ["https://bol7.com/logo.png"],

      bodyVariables: "Sher Singh",

      // If template has button
      //   buttonVariables: ["Verify Now"],
    };

    const response = await fetch(
      "https://chat.bol7.com/api/whatsapp/SendTemplate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    console.log("Bol7 Response:", data);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("WhatsApp API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});



// listening
app.listen(3200, () => {
  console.log("Listening to the http://localhost:3200");
})