let express = require('express')
let router = express.Router()
let User = require('../../modals/users')
const patientOrder = require('../../modals/patientOrder')
const PatientForm = require('../../modals/patientForm');
let Users = require('../../modals/users');
const patientForm = require('../../modals/patientForm');
const SalaryTransaction = require('../../modals/salary');
const upload = require('../../multer');


// auth function
async function authApi() {
    try {
        const loginResponse = await fetch("https://proship.prozo.com/api/auth/signin", {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: "ravikantkaushal23@gmail.com",
                password: "pzUBu3"
            })
        });

        const loginData = await loginResponse.json();
        // console.log("Login response:", loginData);
        return loginData

    } catch (error) {
        console.log(error);
        return null

    }
}



router.post("/create-order", async (req, res) => {
    try {
        const loginData = await authApi();
        console.log(loginData);

        if (!loginData.accessToken) {
            return res.status(400).json({ error: "Failed to authenticate", loginData });
        }

        let {
            patientName,
            mobileNumber,
            houseOrStreet,
            cityOrDistrict,
            state,
            pinCode,
            pickupLocation,
            paymentMode,
            skuId,
            invoiceValue,
            productName,
            productQuantity,
            unitPrice,
            weight,
            length,
            breadth,
            height,
            id,
            channel
        } = req.body;

        // Define pickup details dynamically
        const pickup_details =
            pickupLocation ===
                "BSRF NGO, SARSWATI VIHAR GANGA FORM HOUSE KE SAMNE BHATI LAB WALI NEW BUILDING MELROSE BYE PASS ALIGARH UTTAR PRADESH, Aligarh, Uttar Pradesh, India, 202001"
                ? {
                    from_name: "Ravi Kant Kaushal",
                    from_phone_number: "7618271707",
                    from_address:
                        "BSRF NGO, SARSWATI VIHAR GANGA FORM HOUSE KE SAMNE BHATI LAB WALI NEW BUILDING MELROSE BYE PASS ALIGARH UTTAR PRADESH, Aligarh, Uttar Pradesh, India, 202001",
                    from_country: "IN",
                    from_email: "bsrfngo@gmail.com",
                    // from_pincode: "110001",
                    from_pincode: "202001",
                    from_city: "Aligarh",
                    from_state: "Uttar Pradesh",
                    gstin: "09EHFPK4351A1ZM",
                }
                : {
                    from_name: "Ravi Kant Kaushal",
                    from_phone_number: "9410848459",
                    from_address:
                        "BSRF INDIA, 228 Durga Nagar Ram Nagar Melrose bye pass Aligarh UPB B Grirls inter college, ALIGARH,Uttar Pradesh, India, 202001",
                    from_country: "IN",
                    from_email: "bsrfngo@gmail.com",
                    from_pincode: "202001",
                    from_city: "Aligarh",
                    from_state: "Uttar Pradesh",
                    gstin: "09EHFPK4351A1ZM",
                };
        console.log(pickup_details);


        // 🧩 Step 2: Proceed to create order only if pincode is serviceable
        const orderResponse = await fetch("https://proship.prozo.com/api/order/create", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${loginData.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                reverse: false,
                order_type: "Forward Shipment",
                item_list: [
                    {
                        units: productQuantity,
                        tax: 0,
                        hsn: "",
                        item_name: productName,
                        sku_id: skuId,
                        item_url: "NA",
                        selling_price: invoiceValue,
                    },
                ],
                pickup_details,
                delivery_details: {
                    to_name: patientName,
                    to_phone_number: mobileNumber,
                    to_address: houseOrStreet,
                    to_country: "IN",
                    to_email: "patient@bsrf.com",
                    to_pincode: pinCode,
                    to_city: cityOrDistrict,
                    to_state: state,
                },
                shipment_detail: [
                    { item_breadth: breadth, item_length: length, item_height: height, item_weight: weight },
                ],
                invoice_value: invoiceValue,
                cod_amount: invoiceValue,
                client_order_id: id,
                is_reverse: false,
                invoice_number: id,
                payment_mode: paymentMode,
                reference: id,
                channel_name: channel,
            }),
        });

        const data = await orderResponse.json();
        // console.log(id);
        // console.log(data);

        if (!data.result) {
            console.log(data);
            return res.json({ success: false, error: data.message });
        }

        console.log(data);


        // 🧾 Save order if successful
        if (data?.result && data?.meta?.message != "Order already placed with reference number") {
            // let userId = await Users.findById(req.session.userId).select('_id')
            // console.log(data);
            let awb = data.result.awb_number
            // console.log(awb);

            let update = await patientForm.findByIdAndUpdate(id, { 'otherStatus.trackingIdStatus': awb })

            console.log(update);

            const savedOrder = await patientOrder.create({
                patientId: id,
                userId: update.referredBy,
                message: data.message,
                meta: data.meta,
                ...data.result,
            });
            console.log("🧾 Order saved:", savedOrder._id);
        }

        res.json({ success: true, message: data?.meta?.message?.includes('already') ? data?.meta?.message : "Order created successfully", data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error creating order" });
    }
});




// services/smartship.service.js

let accessToken = null;
let tokenExpiry = null;

async function getSmartToken() {
    if (accessToken && tokenExpiry > Date.now()) {
        return accessToken;
    }

    const response = await fetch('https://oauth.smartship.in/loginToken.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: 'ravikantkaudhal23@gmail.com',
            password: 'f65a5a9140efe6e8e8e0f20a0207b117',
            client_id: 'ILMGQH12PPF0BIU601GIWT9HM0ZMWATS0DMZOXQ',
            client_secret: 'P4GTP61RO#U(_KD2*BUDTB(QII9AK#1FW6F+U9W',
            grant_type: "password"
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error_description || 'Token API failed');
    }

    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);

    return accessToken;
}


router.post("/create-order-with-smartship", async (req, res) => {
    try {
        const token = await getSmartToken(); // your fetch-based token function
        console.log(token);


        let {
            patientName,
            mobileNumber,
            houseOrStreet,
            cityOrDistrict,
            state,
            pinCode,
            pickupLocation,
            paymentMode,
            skuId,
            invoiceValue,
            productName,
            productQuantity,
            unitPrice,
            weight,
            length,
            breadth,
            height,
            id,
            channel
        } = req.body;

        const hubId =
            pickupLocation ===
                "BSRF NGO, SARSWATI VIHAR GANGA FORM HOUSE KE SAMNE BHATI LAB WALI NEW BUILDING MELROSE BYE PASS ALIGARH UTTAR PRADESH, Aligarh, Uttar Pradesh, India, 202001"
                ? '282303'
                : '282093';

        // 🏢 Pickup (convert to SmartShip HUB ID)
        // const hubId = process.env.SMARTSHIP_HUB_ID; // already created in SmartShip

        // 📦 SmartShip Payload
        const orderPayload = {
            client_order_reference_id: id + '9876',
            shipment_type: 1,
            order_collectable_amount: paymentMode === "COD" ? invoiceValue : 0,
            total_order_value: invoiceValue,
            payment_type: paymentMode === "COD" ? "cod" : "prepaid",

            package_order_weight: weight,
            package_order_length: length,
            package_order_height: height,
            package_order_width: breadth,


            shipper_hub_id: hubId,
            order_invoice_number: id + '87',
            order_invoice_date: new Date().toISOString().split("T")[0],

            product_details: [
                {
                    client_product_reference_id: skuId,
                    product_name: productName,
                    product_quantity: productQuantity,
                    product_invoice_value: unitPrice,
                    product_taxable_value: invoiceValue,
                    product_sgst_amount: 2,
                    product_cgst_amount: 2,
                    product_gst_tax_rate: "5",      // ✅ REQUIRED (5 / 12 / 18 etc)

                    product_sgst_amount: "2.5",
                    product_sgst_tax_rate: "2.5",

                    product_cgst_amount: "2.5",
                    product_cgst_tax_rate: "2.5",
                    product_hsn_code: "30049099",
                }
            ],

            consignee_details: {
                consignee_name: patientName,
                consignee_phone: mobileNumber,
                consignee_email: "patient@bsrf.com",
                consignee_complete_address: houseOrStreet,
                consignee_pincode: pinCode
            }
        };

        // 🚀 API CALL
        const orderResponse = await fetch(
            "https://api.smartship.in/v2/app/Fulfillmentservice/orderRegistrationOneStep",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    request_info: {
                        client_id: 'ILMGQH12PPF0BIU601GIWT9HM0ZMWATS0DMZOXQ',
                        run_type: "create"
                    },
                    orders: [orderPayload]
                }),
            }
        );

        const data = await orderResponse.json();
        // console.log(data);


        if (!data?.status) {
            console.log(data);
            return res.json({ success: false, error: data.message });
        }

        const orderData = data?.data?.success_order_details?.orders?.[0];

        if (!orderData) {
            return res.json({ success: false, error: "Order creation failed", data });
        }

        console.log("✅ SmartShip Order:", orderData);

        // 🧾 Extract values
        const awb = orderData.awb_number;
        const requestOrderId = orderData.request_order_id;
        const labelUrl = data?.data?.shipping_info?.label_url;

        // 🧾 Update patient form
        let update = await patientForm.findByIdAndUpdate(id, {
            "otherStatus.trackingIdStatus": awb
        });

        // 💾 SAVE IN DB (MATCHING YOUR SCHEMA)
        const savedOrder = await patientOrder.create({
            message: "Order created via SmartShip",

            meta: {
                message: "success",
                status: "created",
                success: true
            },

            id: id,
            orderId: requestOrderId,
            orderStatus: "Created",
            reference: id,
            order_type: "Forward Shipment",

            patientId: id,
            userId: update?.referredBy,

            item_list: [
                {
                    units: productQuantity,
                    tax: 0,
                    hsn: "",
                    item_name: productName,
                    sku_id: skuId,
                    item_url: "NA",
                    selling_price: invoiceValue,
                }
            ],

            pickup_details: {
                from_name: "BSRF",
                from_phone_number: "9999999999",
                from_address: pickupLocation,
                from_country: "IN",
                from_email: "bsrfngo@gmail.com",
                from_pincode: "202001",
                from_city: "Aligarh",
                from_state: "Uttar Pradesh",
            },

            delivery_details: {
                to_name: patientName,
                to_phone_number: mobileNumber,
                to_address: houseOrStreet,
                to_country: "IN",
                to_email: "patient@bsrf.com",
                to_pincode: pinCode,
                to_city: cityOrDistrict,
                to_state: state,
            },

            shipment_detail: [
                {
                    item_breadth: breadth,
                    item_length: length,
                    item_height: height,
                    item_weight: weight,
                }
            ],

            invoice_value: invoiceValue,
            cod_amount: invoiceValue,
            client_order_id: id,
            invoice_number: id,
            payment_mode: paymentMode,

            awb_number: awb,
            label_url: labelUrl,

            shipment_type: "forward",
            provider: 'smartship',
            channel_name: channel,
            is_reverse: false,
        });

        console.log("🧾 Order saved:", savedOrder._id);

        res.json({
            success: true,
            message: "SmartShip Order Created",
            awb,
            labelUrl,
            data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error creating SmartShip order" });
    }
});



// auth function
// async function authApi() {
//     try {
//         // const loginResponse = await fetch("https://proshipdev.prozo.com/api/auth/signin", {
//         //     method: 'POST',
//         //     headers: { "Content-Type": "application/json" },
//         //     body: JSON.stringify({
//         //         username: "test.staging@prozo.com",
//         //         password: "Hello@123"
//         //     })
//         // });

//         const loginResponse = await fetch("https://proshipdev.prozo.com/api/auth/signin", {
//             method: 'POST',
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                 username: "ravikantkaushal23@gmail.com",
//                 password: "qhmnGV"
//             })
//         });
//         console.log(loginResponse);


//         const loginData = await loginResponse.json();
//         console.log("Login response:", loginData);
//         return loginData

//     } catch (error) {
//         console.log(error);
//         return null
//     }
// }

// async function authApi() {
//     try {
//         const loginResponse = await fetch("https://proshipdev.prozo.com/api/auth/signin", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                 username: "ravikantkaushal23@gmail.com",
//                 password: "qhmnGV"
//             })
//         });

//         // Log status for debugging
//         console.log("Status:", loginResponse.status);

//         // If API returns non-200 response
//         if (!loginResponse.ok) {
//             const errorText = await loginResponse.text();
//             console.log("API Error Response:", errorText);
//             return { success: false, error: "Request failed", status: loginResponse.status };
//         }

//         // Parse JSON only if OK
//         const loginData = await loginResponse.json();
//         console.log("Login response JSON:", loginData);

//         return loginData;

//     } catch (error) {
//         console.log("Network/Code Error:", error);
//         return { success: false, error: "Network error" };
//     }
// }



// router.get('/allorders', async (req, res) => {
//     if (req.session.userId) {
//         try {
//             let user = await Users.findOne({ _id: req.session.userId })
//             let result = []
//             let createOrder = true
//             let orders
//             let referredUsers

//             if (user.role == 'Coordinator') {
//                 // extract IDs
//                 referredUsers = await Users.find(
//                     { referredBy: user.userId },
//                     { userId: 1, name: 1 } // only fetch IDs
//                 );

//                 const referredUserIds = referredUsers.map(u => u.userId);
//                 orders = await patientOrder.find({
//                     userId: {
//                         $in: [user.userId, ...referredUserIds]
//                     }
//                 }).sort({ createdAt: -1 });
//             }
//             else {
//                 referredUsers = await Users.find().select('userId name')
//                 orders = await patientOrder.find().sort({ createdAt: -1 })
//             }

//             orders = orders.filter((o) => o.awb_number)
//             orders = await Promise.all(
//                 orders.map(async (or) => {
//                     const mob = await patientForm
//                         .findOne({ _id: or.patientId })
//                         .select('mobileNumber');

//                     // console.log(or.orderStatus);


//                     await patientForm
//                         .findOneAndUpdate({ _id: or.patientId }, { 'otherStatus.deliveryStatus': or.orderStatus })

//                     // orderStatus

//                     // console.log(mob);
//                     // console.log({
//                     //     ...or.toObject(),   // keep original order data
//                     //     mobile: mob?.mobileNumber || null
//                     // });


//                     return {
//                         ...or.toObject(),   // keep original order data
//                         mobile: mob?.mobileNumber || null
//                     };
//                 })
//             );

//             // console.log(orders[0]);


//             let awbs = orders.map(or => or.awb_number).join(',')
//             // console.log(awbs);


//             const loginData = await authApi()
//             // console.log(loginData);

//             // Check for valid token
//             if (!loginData.accessToken) {
//                 console.log("Failed to Authenticate");
//                 return res.render('forms', { applications: [], page: "All Orders", user, createOrder });
//             }


//             var myHeaders = new Headers();
//             myHeaders.append("Authorization", `Bearer ${loginData.accessToken}`);

//             var requestOptions = {
//                 method: 'GET',
//                 headers: myHeaders,
//                 redirect: 'follow'
//             };

//             let data = await fetch(`https://proship.prozo.com/api/order/track_waybill?waybills=${awbs}`, requestOptions)

//             let results = await data.json()

//             // let changeArray = []
//             if (results.waybillDetails) {
//                 let newOrders = orders.map((o) => {
//                     let track = results.waybillDetails.find(r => r.waybill == o.awb_number)
//                     // changeArray.push({ awb_number: o.awb_number, orderStatus: track.currentStatus })
//                     return { ...o, track }
//                 })
//                 result = newOrders
//             }
//             // changeArray.forEach(async (or) => {
//             //     await patientOrder.findOneAndUpdate({ awb_number: or.awb_number }, { orderStatus: or.orderStatus })
//             // })

//             // console.log(result);



//             let groupedById = result.reduce((acc, order) => {
//                 const name = order.userId;

//                 if (!acc[name]) {
//                     acc[name] = [];
//                 }

//                 acc[name].push(order);
//                 return acc;
//             }, {});

//             referredUsers.push({ userId: user.userId, name: user.name })
//             referredUsers.forEach((u) => {
//                 for (let key in groupedById) {
//                     // console.log(key, u.userId);
//                     if (u.userId == key) {
//                         groupedById = { ...groupedById, [u.name]: groupedById[key] }
//                         delete groupedById[key]
//                     }
//                 }
//             })
//             // console.log(groupedById);

//             res.render('allorders', { applications: groupedById, page: "All Orders", user, createOrder });
//         } catch (error) {
//             console.log(error);
//             res.redirect('/auth/login')
//         }
//     }
//     else {
//         res.redirect('/auth/login')
//     }
// });



router.get('/allorders', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }

    try {
        let user = await Users.findOne({ _id: req.session.userId });

        let orders;
        let referredUsers;
        let createOrder = true;

        // 👇 Role-based filtering
        if (user.role == 'Coordinator') {
            referredUsers = await Users.find(
                { referredBy: user.userId },
                { userId: 1, name: 1 }
            );

            const referredUserIds = referredUsers.map(u => u.userId);

            orders = await patientOrder.find({
                userId: {
                    $in: [user.userId, ...referredUserIds]
                }
            }).sort({ createdAt: -1 });

        } else {
            referredUsers = await Users.find().select('userId name');
            orders = await patientOrder.find().sort({ createdAt: -1 });
        }

        // ✅ Only orders with AWB
        orders = orders.filter(o => o.awb_number);

        // ✅ Attach mobile + update delivery status
        orders = await Promise.all(
            orders.map(async (or) => {
                const mob = await patientForm
                    .findOne({ _id: or.patientId })
                    .select('mobileNumber');

                await patientForm.findOneAndUpdate(
                    { _id: or.patientId },
                    { 'otherStatus.deliveryStatus': or.orderStatus }
                );

                return {
                    ...or.toObject(),
                    mobile: mob?.mobileNumber || null
                };
            })
        );

        // ==============================
        // 🚀 SPLIT ORDERS BY PROVIDER
        // ==============================

        let proshipOrders = orders.filter(o => o.provider === "proship");
        let smartshipOrders = orders.filter(o => o.provider === "smartship");

        // ==============================
        // 🚚 PROSHIP TRACKING
        // ==============================

        let proshipTracking = [];

        if (proshipOrders.length) {
            let awbs = proshipOrders.map(o => o.awb_number).join(',');

            const loginData = await authApi();

            if (loginData.accessToken) {
                const response = await fetch(
                    `https://proship.prozo.com/api/order/track_waybill?waybills=${awbs}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${loginData.accessToken}`
                        }
                    }
                );

                const data = await response.json();
                proshipTracking = data.waybillDetails || [];
            } else {
                console.log("❌ Proship Auth Failed");
            }
        }

        // ==============================
        // 📦 SMARTSHIP TRACKING
        // ==============================

        let smartshipTracking = [];

        if (smartshipOrders.length) {
            let awbs = smartshipOrders.map(o => o.awb_number).join(',');
            console.log(awbs);


            const token = await getSmartToken();

            const response = await fetch(
                `https://api.smartship.in/v1/Trackorder?tracking_numbers=${awbs}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();
            // console.log(data.data);
            let obj = data?.data?.scans || {}
            let mainData = []
            for (let key in obj) {
                mainData.push(obj[key])
            }

            smartshipTracking = mainData || [];
        }

        // console.log(proshipTracking.length, smartshipTracking);


        // ==============================
        // 🔗 MERGE TRACKING DATA
        // ==============================

        let result = orders.map((o) => {
            let track = null;

            // if (o.provider === "proship") {
            //     track = proshipTracking.find(t => t.waybill == o.awb_number);
            // }

            if (o.provider === "smartship") {
                track = smartshipTracking?.find(t => {
                    console.log(t[0].tracking_number, o.awb_number);
                    return t[0].tracking_number == o.awb_number
                });
                // console.log("smartshipt", track);
            }
            else {
                track = proshipTracking.find(t => t.waybill == o.awb_number);
            }

            return { ...o, track };
        });

        let smartship = result.filter(r => r.provider == "smartship")
        // console.log(smartship);


        // ==============================
        // 🔄 UPDATE STATUS IN DB
        // ==============================

        await Promise.all(
            result.map(async (order) => {
                if (!order.track) return;

                let status =
                    order.provider === "proship"
                        ? order.track.currentStatus
                        : order.track.current_status;

                await patientOrder.findOneAndUpdate(
                    { awb_number: order.awb_number },
                    { orderStatus: status }
                );

                await patientForm.findOneAndUpdate(
                    { _id: order.patientId },
                    { 'otherStatus.deliveryStatus': status }
                );
            })
        );

        // ==============================
        // 📊 GROUP BY USER NAME
        // ==============================

        let groupedById = result.reduce((acc, order) => {
            const name = order.userId;

            if (!acc[name]) {
                acc[name] = [];
            }

            acc[name].push(order);
            return acc;
        }, {});

        referredUsers.push({ userId: user.userId, name: user.name });

        referredUsers.forEach((u) => {
            for (let key in groupedById) {
                if (u.userId == key) {
                    groupedById = {
                        ...groupedById,
                        [u.name]: groupedById[key]
                    };
                    delete groupedById[key];
                }
            }
        });

        // ==============================
        // 🎨 RENDER
        // ==============================

        res.render('allorders', {
            applications: groupedById,
            page: "All Orders",
            user,
            createOrder
        });

    } catch (error) {
        console.log(error);
        res.redirect('/auth/login');
    }
});






// router.get('/work', async (req, res) => {
//     if (req.session.userId) {
//         console.log(req.session.userId);

//         try {
//             let user = await Users.findOne({ _id: req.session.userId })
//             let referredUsers
//             let orders
//             let users = []
//             if (user.role == 'Coordinator') {
//                 users.push(user)
//             }
//             else {
//                 users = await Users.find()
//             }


//             let data = async (user) => {
//                 referredUsers = await Users.find(
//                     { referredBy: user.userId },
//                     { userId: 1, name: 1 } // only fetch IDs
//                 );


//                 if (referredUsers.length <= 0) {
//                     return
//                 }


//                 referredUsers.push({ userId: user.userId, name: user.name })

//                 const referredUserIds = referredUsers.map(u => u.userId);
//                 orders = await patientOrder.find({
//                     userId: {
//                         $in: [user.userId, ...referredUserIds]
//                     },
//                     orderStatus: "DELIVERED"
//                 });

//                 if (orders.length <= 0) {
//                     return
//                 }



//                 let groupedById = orders.reduce((acc, order) => {
//                     const name = order.userId;
//                     if (!acc[name]) {
//                         acc[name] = [];
//                     }

//                     acc[name].push(order);
//                     return acc;
//                 }, {});

//                 let users = await Users.find()
//                 users.forEach((u) => {
//                     for (let key in groupedById) {
//                         if (u.userId == key) {
//                             let named = u.name
//                             if (u.name == user.name) {
//                                 named = "TeamLeader"
//                             }
//                             groupedById = { ...groupedById, [named]: groupedById[key].length }
//                             delete groupedById[key]
//                         }
//                     }
//                 })



//                 return {
//                     teamLeader: user.name,
//                     work: groupedById
//                 }
//             }



//             let allresult = users.map(async (user) => {
//                 let result = await data(user)
//                 return result
//                 // if (result) {
//                 //     allresult.push(result)
//                 // }   
//             })


//             console.log(allresult);
//             // console.log(real);


//             res.render('work/work', { page: "Work", user });
//         } catch (error) {
//             console.log(error);
//             res.redirect('/auth/login')
//         }
//     }
//     else {
//         res.redirect('/auth/login')
//     }
// });

// router.get('/work', async (req, res) => {
//     if (!req.session.userId) {
//         return res.redirect('/auth/login');
//     }

//     try {
//         const loggedInUser = await Users.findOne({ _id: req.session.userId });

//         let users = [];
//         if (loggedInUser.role === 'Coordinator') {
//             users.push(loggedInUser);
//         } else {
//             users = await Users.find();
//         }

//         const data = async (user) => {
//             const referredUsers = await Users.find(
//                 { referredBy: user.userId },
//                 { userId: 1, name: 1 }
//             );

//             if (!referredUsers.length) return null;

//             referredUsers.push({ userId: user.userId, name: user.name });

//             const referredUserIds = referredUsers.map(u => u.userId);

//             const orders = await patientOrder.find({
//                 userId: { $in: referredUserIds },
//                 orderStatus: "DELIVERED"
//             });

//             // if (!orders.length) return null;

//             let groupedById = orders.reduce((acc, order) => {
//                 acc[order.userId] = (acc[order.userId] || 0) + 1;
//                 return acc;
//             }, {});

//             const allUsers = await Users.find();

//             allUsers.forEach(u => {
//                 if (groupedById[u.userId]) {
//                     const name = u.name === user.name ? "TeamLeader" : u.name;
//                     groupedById[name] = groupedById[u.userId];
//                     delete groupedById[u.userId];
//                 }
//             });

//             return {
//                 teamLeader: user.name,
//                 work: groupedById
//             };
//         };

//         // ✅ WAIT for all promises to resolve
//         const allresult = (await Promise.all(users.map(user => data(user))))
//             .filter(Boolean); // remove null results

//         console.log(allresult);

//         res.render('work/work', {
//             page: "Work",
//             user: loggedInUser,
//             allresult
//         });



//     } catch (error) {
//         console.log(error);
//         res.redirect('/auth/login');
//     }
// });


function getDateRange(range) {
    const now = new Date();
    let startDate, endDate;

    if (range === "lastMonth") {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    }
    else {
        // Fallback to thisMonth
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
    }

    return { startDate, endDate };
}

// router.get('/work', async (req, res) => {
//     if (!req.session.userId) return res.redirect('/auth/login');

//     try {
//         const loggedInUser = await Users.findById(req.session.userId);

//         const { range = "thisMonth", from, to } = req.query;
//         const { startDate, endDate } = getDateRange(range, from, to);

//         let users = [];
//         if (loggedInUser.role != 'Coordinator') {
//             users.push(loggedInUser);
//         } else {
//             users = await Users.find();
//         }

//         const data = async (user) => {
//             const referredUsers = await Users.find(
//                 { referredBy: user.userId },
//                 { userId: 1, name: 1 }
//             );

//             if (!referredUsers.length) return null;

//             referredUsers.push({ userId: user.userId, name: user.name });

//             const referredUserIds = referredUsers.map(u => u.userId);

//             const orders = await patientOrder.find({
//                 userId: { $in: referredUserIds },
//                 orderStatus: "DELIVERED",
//                 statusDate: { $gte: startDate, $lte: endDate }
//             });

//             // if (!orders.length) return null;

//             let groupedById = orders.reduce((acc, order) => {
//                 acc[order.userId] = (acc[order.userId] || 0) + 1;
//                 return acc;
//             }, {});

//             const allUsers = await Users.find();

//             allUsers.forEach(u => {
//                 if (groupedById[u.userId]) {
//                     const name = u.name === user.name ? "TeamLeader" : u.name;
//                     groupedById[name] = groupedById[u.userId];
//                     delete groupedById[u.userId];
//                 }
//             });

//             console.log({
//                 teamLeader: user.name,
//                 position: user.position,
//                 work: groupedById
//             });


//             return {
//                 teamLeader: user.name,
//                 position: user.position,
//                 work: groupedById
//             };
//         };

//         const allresult = (await Promise.all(users.map(user => data(user)))).filter(Boolean);

//         res.render('work/work', {
//             page: "Work",
//             user: loggedInUser,
//             allresult,
//             range,
//             from,
//             to
//         });

//     } catch (err) {
//         console.error(err);
//         res.redirect('/auth/login');
//     }
// });

router.get('/work', async (req, res) => {
    if (!req.session.userId) return res.redirect('/auth/login');

    try {
        // const loggedInUser = await Users.findById(req.session.userId);

        // const { range = "thisMonth", from, to } = req.query;
        // const { startDate, endDate } = getDateRange(range, from, to);

        // let users = [];
        // if (loggedInUser.role != 'Coordinator') {
        //     users.push(loggedInUser);
        // } else {
        //     users = await Users.find();
        // }

        // const data = async (user) => {
        //     const referredUsers = await Users.find({},
        //         { userId: 1, name: 1 }
        //     );

        //     if (!referredUsers.length) return null;

        //     referredUsers.push({ userId: user.userId, name: user.name });

        //     const referredUserIds = referredUsers.map(u => u.userId);

        //     const orders = await patientOrder.find({
        //         userId: { $in: referredUserIds },
        //         orderStatus: "DELIVERED",
        //         statusDate: { $gte: startDate, $lte: endDate }
        //     });

        //     // if (!orders.length) return null;

        //     let groupedById = orders.reduce((acc, order) => {
        //         acc[order.userId] = (acc[order.userId] || 0) + 1;
        //         return acc;
        //     }, {});

        //     const allUsers = await Users.find();

        //     allUsers.forEach(u => {
        //         if (groupedById[u.userId]) {
        //             const name = u.name === user.name ? "TeamLeader" : u.name;
        //             groupedById[name] = groupedById[u.userId];
        //             delete groupedById[u.userId];
        //         }
        //     });

        //     console.log({
        //         teamLeader: user.name,
        //         position: user.position,
        //         work: groupedById
        //     });


        //     return {
        //         teamLeader: user.name,
        //         position: user.position,
        //         work: groupedById
        //     };
        // };

        // const allresult = (await Promise.all(users.map(user => data(user)))).filter(Boolean);

        const loggedInUser = await Users.findById(req.session.userId);

        const { range = "thisMonth", from, to } = req.query;
        const { startDate, endDate } = getDateRange(range, from, to);

        // Fetch target users: position 'centre head', type 'singleorder'
        let targetUsers = await Users.find({
            position: { $regex: new RegExp("^centre head$", "i") },
            type: { $regex: new RegExp("^singleorder$", "i") }
        });

        const targetUserIds = targetUsers.map(u => u.userId);

        const orders = await patientOrder.find({
            userId: { $in: targetUserIds },
            orderStatus: "DELIVERED",
            statusDate: { $gte: startDate, $lte: endDate }
        });

        // Initialize groupedById with all target users, so even zero counts show up
        let groupedById = targetUsers.reduce((acc, user) => {
            acc[user.userId] = {
                user: user,
                count: 0,
                amount: 0,
                status: 'Unpaid'
            };
            return acc;
        }, {});

        // Increment count for matched orders
        orders.forEach(order => {
            if (groupedById[order.userId]) {
                groupedById[order.userId].count += 1;
            }
        });

        // Fetch salary records specific to this date range
        const salaries = await SalaryTransaction.find({
            userId: { $in: targetUserIds },
            startDate: startDate
        });

        // Mark paid statuses
        salaries.forEach(salary => {
            if (groupedById[salary.userId]) {
                groupedById[salary.userId].status = 'Paid';
            }
        });

        // Form final object for view
        let allresult = targetUsers.reduce((acc, user) => {
            const data = groupedById[user.userId];
            data.amount = data.count * 1000;
            // The view expects key as "Name | User Id | Mobile" and value as the obj or string
            acc[`${user.name} | ${user.userId} | ${user.mobile}`] = data;
            return acc;
        }, {});

        res.render('work/work', {
            page: "Work",
            user: loggedInUser,
            allresult,
            range,
            from,
            to,
            startDateStr: startDate.toISOString(),
            endDateStr: endDate.toISOString()
        });

    } catch (err) {
        console.error(err);
        res.redirect('/auth/login');
    }
});




// router.get('/details/:awb', async (req, res) => {

//     try {
//         let user = await Users.findOne({ _id: req.session.userId })
//         // const applications = await PatientForm.find().sort({ createdAt: -1 });
//         let result = []
//         // let createOrder = true

//         let orders = await patientOrder.find()
//         // console.log(orders);
//         let awbs = req.params.awb
//         // console.log(awbs);

//         const loginData = await authApi()
//         // Check for valid token
//         if (!loginData.accessToken) {
//             console.log("Failed to Authenticate");
//             return res.render('forms', { applications: [], page: "All Orders", user, createOrder });
//         }

//         // console.log(loginData);

//         var myHeaders = new Headers();
//         myHeaders.append("Authorization", `Bearer ${loginData.accessToken}`);

//         var requestOptions = {
//             method: 'GET',
//             headers: myHeaders,
//             redirect: 'follow'
//         };

//         let data = await fetch(`https://proship.prozo.com/api/order/track_waybill?waybills=${awbs}`, requestOptions)
//         // .then(response => response.text())
//         // .then(result => console.log(result))
//         // .catch(error => console.log('error', error));
//         let results = await data.json()
//         // console.log(results.waybillDetails);
//         // console.log(results.waybillDetails[0].order_history);
//         if (results.waybillDetails) {
//             // console.log(orders);

//             let newOrders = orders.map((o) => {
//                 let track = results.waybillDetails.find(r => r.waybill == o.awb_number)
//                 if (track) {
//                     result = { ...o.toObject(), track }
//                 }
//                 // console.log("track",track);


//                 // return track ? { ...o, track } : 
//             })

//             // console.log(result.track.currentStatus);
//             // console.log(newOrders);

//         }
//         // res.render('allorders', { applications: result, page: "All Orders", user, createOrder });
//         res.json({ success: true, result })
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false })
//     }

// });







// router.get('/allorders', async (req, res) => {
//     const loginData = await authApi()
//     var myHeaders = new Headers();
//     myHeaders.append("Authorization", `Bearer ${loginData.accessToken}`);

//     var requestOptions = {
//         method: 'GET',
//         headers: myHeaders,
//         redirect: 'follow'
//     };

//     fetch("https://proshipdev.prozo.com/api/order/track_waybill?waybills=14408950426088,14408950144081", requestOptions)
//         .then(response => response.text())
//         .then(result => {
//             console.log(result)
//             res.json({ tarcking: true })
//         })
//         .catch(error => console.log('error', error));
// })


// router.delete('/cancel-order/:awb', async (req, res) => {
//     try {
//         let awb = req.params.awb
//         console.log(awb);

//         const loginData = await authApi()
//         // Check for valid token
//         if (!loginData.accessToken) {
//             console.log("Failed to Authenticate");
//             return res.json({ success: false, message: "Failed to Authenticate" })
//         }

//         var myHeaders = new Headers();
//         // myHeaders.append("Authorization", "Bearer Token");
//         myHeaders.append("Authorization", `Bearer ${loginData.accessToken}`)
//         myHeaders.append("Content-Type", "application/json");

//         var raw = JSON.stringify({
//             "waybill": awb
//         });

//         var requestOptions = {
//             method: 'POST',
//             headers: myHeaders,
//             body: raw,
//             redirect: 'follow'
//         };

//         let data = await fetch("https://proship.prozo.com/api/order/cancel_order", requestOptions)
//         // .then(response => response.text())
//         // .then(result => console.log(result))
//         // .catch(error => console.log('error', error));
//         let result = await data.json()
//         console.log(result);
//         res.json({ success: true, data })
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error })

//     }
// })


router.get('/details/:awb', async (req, res) => {
    try {
        const user = await Users.findOne({ _id: req.session.userId });
        const awb = req.params.awb;

        console.log("🔍 Tracking AWB:", awb);

        // 🔍 Find order from DB
        const order = await patientOrder.findOne({ awb_number: awb });

        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        let track = null;

        // ==============================
        // 🚚 PROSHIP TRACKING
        // ==============================
        if (order.provider === "proship") {

            const loginData = await authApi();

            if (!loginData.accessToken) {
                return res.json({ success: false, message: "Proship Auth Failed" });
            }

            const response = await fetch(
                `https://proship.prozo.com/api/order/track_waybill?waybills=${awb}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${loginData.accessToken}`
                    }
                }
            );

            const data = await response.json();

            track = data?.waybillDetails?.find(r => r.waybill == awb) || null;
        }

        // ==============================
        // 📦 SMARTSHIP TRACKING
        // ==============================
        else if (order.provider === "smartship") {

            const token = await getSmartToken();

            const response = await fetch(
                `https://api.smartship.in/v1/Trackorder?tracking_numbers=${awb}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();
            console.log(data);

            let obj = data?.data?.scans || {}
            let mainData = []
            for (let key in obj) {
                mainData.push(obj[key])
            }

            track = mainData[0] || []
        }

        else {
            return res.json({
                success: false,
                message: "Unknown provider"
            });
        }

        // ==============================
        // 🔄 UPDATE STATUS IN DB
        // ==============================

        if (track) {
            let status =
                order.provider === "proship"
                    ? track.currentStatus
                    : track.current_status;

            await patientOrder.findOneAndUpdate(
                { awb_number: awb },
                { orderStatus: status }
            );

            await patientForm.findOneAndUpdate(
                { _id: order.patientId },
                { 'otherStatus.deliveryStatus': status }
            );
        }

        // ==============================
        // 📦 FINAL RESPONSE
        // ==============================

        const result = {
            ...order.toObject(),
            track
        };

        // console.log(result);


        res.json({
            success: true,
            provider: order.provider,
            result
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
});


router.delete('/cancel-order/:awb', async (req, res) => {
    try {
        const awb = req.params.awb;
        console.log("🚫 Cancel AWB:", awb);

        // 🔍 Find order from DB
        const order = await patientOrder.findOne({ awb_number: awb });

        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        let result;

        // ==============================
        // 🚚 PROSHIP CANCEL
        // ==============================
        if (order.provider === "proship") {

            const loginData = await authApi();

            if (!loginData.accessToken) {
                return res.json({ success: false, message: "Proship Auth Failed" });
            }

            const response = await fetch(
                "https://proship.prozo.com/api/order/cancel_order",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${loginData.accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        waybill: awb
                    })
                }
            );

            result = await response.json();
        }

        // ==============================
        // 📦 SMARTSHIP CANCEL
        // ==============================
        else if (order.provider === "smartship") {

            const token = await getSmartToken();

            const requestOrderId = order.orderId;
            console.log(requestOrderId);


            if (!requestOrderId) {
                return res.json({
                    success: false,
                    message: "Missing SmartShip request_order_id"
                });
            }

            const response = await fetch(
                "https://api.smartship.in/v2/app/Fulfillmentservice/cancelOrder",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        request_info: {
                            client_id: "ILMGQH12PPF0BIU601GIWT9HM0ZMWATS0DMZOXQ"
                        },
                        request_order_ids: [requestOrderId]
                    })
                }
            );

            result = await response.json();
            console.log("📦 SmartShip Cancel:", result);


        }

        else {
            return res.json({
                success: false,
                message: "Unknown provider"
            });
        }

        console.log("📦 Cancel Result:", result);

        // ==============================
        // 🧾 UPDATE DB STATUS
        // ==============================

        await patientOrder.findOneAndUpdate(
            { awb_number: awb },
            { orderStatus: "Cancelled" }
        );

        await patientForm.findOneAndUpdate(
            { _id: order.patientId },
            { 'otherStatus.deliveryStatus': "Cancelled" }
        );

        // ==============================
        // ✅ RESPONSE
        // ==============================

        res.json({
            success: true,
            message: "Order cancelled successfully",
            provider: order.provider,
            data: result
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
});


router.post('/pay-salary', upload.single('receipt'), async (req, res) => {
    try {
        const { userId, startDate, endDate, amount, deliveriesCount } = req.body;
        const receiptUrl = req.file ? `/uploads/excelfiles/${req.file.filename}` : null;

        if (!receiptUrl) {
            return res.status(400).json({ success: false, message: "Receipt file is required" });
        }

        const newSalary = await SalaryTransaction.create({
            userId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            amount,
            deliveriesCount,
            receiptUrl,
            status: "Paid"
        });

        res.json({ success: true, message: "Salary paid successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to process salary payment" });
    }
});

module.exports = router