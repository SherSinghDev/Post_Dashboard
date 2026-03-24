let express = require('express')
let router = express.Router()
let User = require('../../modals/users')
let bcrypt = require("bcrypt")
// let Users = require('../../modals/users')
let Doctor = require('../../modals/doctors')
let PatientForm = require('../../modals/patientForm')
const patientForm = require('../../modals/patientForm')
const users = require('../../modals/users')
const stockTransactions = require('../../modals/stockTransactions')
const multer = require('multer');



// ===== MULTER CONFIGURATION =====
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './src/assets/uploads//receipt'); // ensure this folder exists
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
});

const upload = multer({ storage });


// GET all applications
router.get('/stocktransactions', async (req, res) => {
    if (req.session.userId) {
        try {
            let user = await users.findOne({ _id: req.session.userId })
            // const applications = await PatientForm.find().sort({ createdAt: -1 });
            let result = await stockTransactions.find({
                $or: [
                    { receiverId: user.userId },
                    { senderId: user.userId }
                ]
            }).sort({ createdAt: -1 });

            let districtHeads = await users.find({ position: 'District Head' })
            let blocktHeads = await users.find({ position: 'Block Head/City Head' })
            let centreHeads = await users.find({ position: 'Centre Head' })

            // console.log(districtHeads,blocktHeads,centreHeads);
            res.render('stockTransactions', { applications: result, page: "Stock Transactions", user, districtHeads, blocktHeads, centreHeads });
        } catch (error) {
            console.log(error);
            res.redirect('/auth/login')
        }
    }
    else {
        res.redirect('/auth/login')
    }
});

// ===== POST ROUTE =====
const mongoose = require('mongoose');
const stock = require('../../modals/stock')
const moneyTransaction = require('../../modals/moneyTransaction')

router.post('/newstocktransaction', async (req, res) => {
    // const session = await mongoose.startSession();
    // session.startTransaction();
    try {
        let {
            receiverId,
            OrthoCare = 0,
            DetoxCare = 0,
            ParentsWellnessCare = 0,
            ImmunityBoosterCare = 0,
            DiabetesCare = 0,
            HeartCare = 0,
            DigestiveCare = 0,
            EyeCare = 0,
            WeightLossCare = 0,
            EnergyAndWeaknessCare = 0,
            HairCare = 0,
            SkinCare = 0,
            ThyroidCare = 0,
            LiverAndKidneyCare = 0,
            LadiesWellnessCare = 0,
            InfinityMaleWellness = 0,
            InfinityFemaleWellness = 0,
            PilesCare = 0,
            AsthmaCare = 0,
            NeuroCare = 0,
            BloodPurifierCare = 0,
            BrainAndMemoryCare = 0,
            PowerWellnessCare = 0,
            TotalWellnessCare = 0,
            totalStock = 0,
        } = req.body;

        console.log(req.body);


        // ✅ Convert everything safely
        OrthoCare = +(OrthoCare);
        DetoxCare = +(DetoxCare);
        ParentsWellnessCare = +(ParentsWellnessCare);
        ImmunityBoosterCare = +(ImmunityBoosterCare);
        DiabetesCare = +(DiabetesCare);
        HeartCare = +(HeartCare);
        DigestiveCare = +(DigestiveCare);
        EyeCare = +(EyeCare);
        WeightLossCare = +(WeightLossCare);
        EnergyAndWeaknessCare = +(EnergyAndWeaknessCare);
        HairCare = +(HairCare);
        SkinCare = +(SkinCare);
        ThyroidCare = +(ThyroidCare);
        LiverAndKidneyCare = +(LiverAndKidneyCare);
        LadiesWellnessCare = +(LadiesWellnessCare);
        InfinityMaleWellness = +(InfinityMaleWellness);
        InfinityFemaleWellness = +(InfinityFemaleWellness);
        PilesCare = +(PilesCare);
        AsthmaCare = +(AsthmaCare);
        NeuroCare = +(NeuroCare);
        BloodPurifierCare = +(BloodPurifierCare);
        BrainAndMemoryCare = +(BrainAndMemoryCare);
        PowerWellnessCare = +(PowerWellnessCare);
        TotalWellnessCare = +(TotalWellnessCare);
        totalStock = +(totalStock);

        let sender = await users.findOne({ _id: req.session.userId })
        let receiver = await users.findOne({ userId: receiverId })

        if (!sender || !receiver) {
            throw new Error('Sender or Receiver not found');
        }

        // 🔹 Get stock documents
        let senderStock = await stock.findOne({ userId: sender._id })
        let receiverStock = await stock.findOne({ userId: receiver._id })

        if (!senderStock || !receiverStock) {
            throw new Error('Stock not found for sender or receiver');
        }

        // // 🔴 Check if sender has enough stock
        // if (senderStock.totalStock < totalStock) {
        //     throw new Error('Insufficient stock');
        // }

        // 🔻 Decrease sender stock
        await stock.updateOne(
            { userId: sender._id },
            {
                $inc: {
                    totalStock: -totalStock,
                    OrthoCare: -OrthoCare,
                    DetoxCare: -DetoxCare,
                    ParentsWellnessCare: -ParentsWellnessCare,
                    ImmunityBoosterCare: -ImmunityBoosterCare,
                    DiabetesCare: -DiabetesCare,
                    HeartCare: -HeartCare,
                    DigestiveCare: -DigestiveCare,
                    EyeCare: -EyeCare,
                    WeightLossCare: -WeightLossCare,
                    EnergyAndWeaknessCare: -EnergyAndWeaknessCare,
                    HairCare: -HairCare,
                    SkinCare: -SkinCare,
                    ThyroidCare: -ThyroidCare,
                    LiverAndKidneyCare: -LiverAndKidneyCare,
                    LadiesWellnessCare: -LadiesWellnessCare,
                    InfinityMaleWellness: -InfinityMaleWellness,
                    InfinityFemaleWellness: -InfinityFemaleWellness,
                    PilesCare: -PilesCare,
                    AsthmaCare: -AsthmaCare,
                    NeuroCare: -NeuroCare,
                    BloodPurifierCare: -BloodPurifierCare,
                    BrainAndMemoryCare: -BrainAndMemoryCare,
                    PowerWellnessCare: -PowerWellnessCare,
                    TotalWellnessCare: -TotalWellnessCare,
                }
            },

        );

        // 🔺 Increase receiver stock
        await stock.updateOne(
            { userId: receiver._id },
            {
                $inc: {
                    totalStock: totalStock,
                    OrthoCare,
                    DetoxCare,
                    ParentsWellnessCare,
                    ImmunityBoosterCare,
                    DiabetesCare,
                    HeartCare,
                    DigestiveCare,
                    EyeCare,
                    WeightLossCare,
                    EnergyAndWeaknessCare,
                    HairCare,
                    SkinCare,
                    ThyroidCare,
                    LiverAndKidneyCare,
                    LadiesWellnessCare,
                    InfinityMaleWellness,
                    InfinityFemaleWellness,
                    PilesCare,
                    AsthmaCare,
                    NeuroCare,
                    BloodPurifierCare,
                    BrainAndMemoryCare,
                    PowerWellnessCare,
                    TotalWellnessCare,
                }
            },

        );

        // 🧾 Save transaction record
        let newTransaction = new stockTransactions({
            receiverId,
            receiverName: receiver.name,
            receiverPosition: receiver.position,
            senderId: sender.userId,
            senderName: sender.name,
            senderPosition: sender.position,
            totalStock,
            OrthoCare,
            DetoxCare,
            ParentsWellnessCare,
            ImmunityBoosterCare,
            DiabetesCare,
            HeartCare,
            DigestiveCare,
            EyeCare,
            WeightLossCare,
            EnergyAndWeaknessCare,
            HairCare,
            SkinCare,
            ThyroidCare,
            LiverAndKidneyCare,
            LadiesWellnessCare,
            InfinityMaleWellness,
            InfinityFemaleWellness,
            PilesCare,
            AsthmaCare,
            NeuroCare,
            BloodPurifierCare,
            BrainAndMemoryCare,
            PowerWellnessCare,
            TotalWellnessCare,
        });

        await newTransaction.save();



        res.json({ success: true });

    } catch (error) {


        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


router.get('/many', async (req, res) => {
    try {
        // 1. Get all users
        const usersList = await users.find().select('_id');

        // 2. Get existing stock userIds
        const existingStocks = await stock.find().select('userId');

        const existingUserIds = existingStocks.map(s => s.userId.toString());

        // 3. Filter users who don't have stock yet
        const usersWithoutStock = usersList.filter(
            u => !existingUserIds.includes(u._id.toString())
        );

        // 4. Prepare bulk insert data
        const stockData = usersWithoutStock.map(u => ({
            userId: u._id,
            totalStock: 0,
            OrthoCare: 0,
            DetoxCare: 0,
            ParentsWellnessCare: 0,
            ImmunityBoosterCare: 0,
            DiabetesCare: 0,
            HeartCare: 0,
            DigestiveCare: 0,
            EyeCare: 0,
            WeightLossCare: 0,
            EnergyAndWeaknessCare: 0,
            HairCare: 0,
            SkinCare: 0,
            ThyroidCare: 0,
            LiverAndKidneyCare: 0,
            LadiesWellnessCare: 0,
            InfinityMaleWellness: 0,
            InfinityFemaleWellness: 0,
            PilesCare: 0,
            AsthmaCare: 0,
            NeuroCare: 0,
            BloodPurifierCare: 0,
            BrainAndMemoryCare: 0,
            PowerWellnessCare: 0,
            TotalWellnessCare: 0,
        }));

        // 5. Insert only missing ones
        if (stockData.length > 0) {
            await stock.insertMany(stockData);
        }

        res.json({
            success: true,
            message: `${stockData.length} users initialized with stock`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});





// user stock

// GET all applications
router.get('/mystock', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }

    try {
        // 🔹 Current user
        let user = await users.findOne({ _id: req.session.userId });

        // 🔹 Current user stock
        let result = await stock.find({ userId: req.session.userId });

        // 🔹 Get users by position (optimized)
        let districtHeads = await users.find({ position: 'District Head' }).select('_id');
        let blockHeads = await users.find({ position: 'Block Head/City Head' }).select('_id');
        let centreHeads = await users.find({ position: 'Centre Head' }).select('_id');

        // 🔹 Extract IDs
        let districtHeadIds = districtHeads.map(u => u._id);
        let blockHeadIds = blockHeads.map(u => u._id);
        let centreHeadIds = centreHeads.map(u => u._id);

        // 🔹 Get stock using userId (FIXED ✅)
        let districtHeadStock = await stock.find({ userId: { $in: districtHeadIds } }).populate('userId');
        let blockHeadStock = await stock.find({ userId: { $in: blockHeadIds } }).populate('userId');
        let centreHeadStock = await stock.find({ userId: { $in: centreHeadIds } }).populate('userId');

        console.log(districtHeadStock, blockHeadStock, centreHeadStock);

        res.render('mystock', {
            applications: result,
            districtHeadStock,
            blockHeadStock,
            centreHeadStock,
            page: "My Stock",
            user
        });

    } catch (error) {
        console.log(error);
        res.redirect('/auth/login');
    }
});



// GET all applications
router.get('/moneytransactions', async (req, res) => {
    if (req.session.userId) {
        try {
            let user = await users.findOne({ _id: req.session.userId })
            // const applications = await PatientForm.find().sort({ createdAt: -1 });
            let result = await moneyTransaction.find({
                $or: [
                    { receiverId: user.userId },
                    { senderId: user.userId }
                ]
            }).sort({ createdAt: -1 });

            let parents = []
            // console.log(user.parentUser);

            parents = await users.find({ _id: user.parentUser })


            // let districtHeads = await users.find({ position: 'District Head' })
            // let centreHeads = await users.find({ position: 'Centre Head' })

            // console.log(parents);
            res.render('moneyTransactions', { applications: result, page: "Stock Transactions", user, parents });
        } catch (error) {
            console.log(error);
            res.redirect('/auth/login')
        }
    }
    else {
        res.redirect('/auth/login')
    }
});

router.post('/newmoneytransaction', upload.single('reciept'), async (req, res) => {
    // const session = await mongoose.startSession();
    // session.startTransaction();
    try {
        let {
            receiverId,
            OrthoCare = 0,
            DetoxCare = 0,
            ParentsWellnessCare = 0,
            ImmunityBoosterCare = 0,
            DiabetesCare = 0,
            HeartCare = 0,
            DigestiveCare = 0,
            EyeCare = 0,
            WeightLossCare = 0,
            EnergyAndWeaknessCare = 0,
            HairCare = 0,
            SkinCare = 0,
            ThyroidCare = 0,
            LiverAndKidneyCare = 0,
            LadiesWellnessCare = 0,
            InfinityMaleWellness = 0,
            InfinityFemaleWellness = 0,
            PilesCare = 0,
            AsthmaCare = 0,
            NeuroCare = 0,
            BloodPurifierCare = 0,
            BrainAndMemoryCare = 0,
            PowerWellnessCare = 0,
            TotalWellnessCare = 0,
            totalStock = 0,
            amount = 0,
        } = req.body;

        console.log(req.body);

        // extract file paths safely
        const receiptUrl = req.file ? `/uploads/receipt/${req.file.filename}` : null;




        // ✅ Convert everything safely
        OrthoCare = +(OrthoCare);
        DetoxCare = +(DetoxCare);
        ParentsWellnessCare = +(ParentsWellnessCare);
        ImmunityBoosterCare = +(ImmunityBoosterCare);
        DiabetesCare = +(DiabetesCare);
        HeartCare = +(HeartCare);
        DigestiveCare = +(DigestiveCare);
        EyeCare = +(EyeCare);
        WeightLossCare = +(WeightLossCare);
        EnergyAndWeaknessCare = +(EnergyAndWeaknessCare);
        HairCare = +(HairCare);
        SkinCare = +(SkinCare);
        ThyroidCare = +(ThyroidCare);
        LiverAndKidneyCare = +(LiverAndKidneyCare);
        LadiesWellnessCare = +(LadiesWellnessCare);
        InfinityMaleWellness = +(InfinityMaleWellness);
        InfinityFemaleWellness = +(InfinityFemaleWellness);
        PilesCare = +(PilesCare);
        AsthmaCare = +(AsthmaCare);
        NeuroCare = +(NeuroCare);
        BloodPurifierCare = +(BloodPurifierCare);
        BrainAndMemoryCare = +(BrainAndMemoryCare);
        PowerWellnessCare = +(PowerWellnessCare);
        TotalWellnessCare = +(TotalWellnessCare);
        totalStock = +(totalStock);

        let sender = await users.findOne({ _id: req.session.userId })
        let receiver = await users.findOne({ userId: receiverId })

        if (!sender || !receiver) {
            throw new Error('Sender or Receiver not found');
        }


        console.log(req.body, receiptUrl);




        // 🧾 Save transaction record
        let newTransaction = new moneyTransaction({
            receiverId,
            receiverName: receiver.name,
            receiverPosition: receiver.position,
            senderId: sender.userId,
            senderName: sender.name,
            senderPosition: sender.position,
            totalStock,
            OrthoCare,
            DetoxCare,
            ParentsWellnessCare,
            ImmunityBoosterCare,
            DiabetesCare,
            HeartCare,
            DigestiveCare,
            EyeCare,
            WeightLossCare,
            EnergyAndWeaknessCare,
            HairCare,
            SkinCare,
            ThyroidCare,
            LiverAndKidneyCare,
            LadiesWellnessCare,
            InfinityMaleWellness,
            InfinityFemaleWellness,
            PilesCare,
            AsthmaCare,
            NeuroCare,
            BloodPurifierCare,
            BrainAndMemoryCare,
            PowerWellnessCare,
            TotalWellnessCare,
            amount,
            receiptUrl
        });

        await newTransaction.save();
        res.json({ success: true });

    } catch (error) {


        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});




module.exports = router