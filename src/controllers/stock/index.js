let express = require('express')
let router = express.Router()
let User = require('../../modals/users')
let bcrypt = require("bcrypt")
// let Users = require('../../modals/users')
let Doctor = require('../../modals/doctors')
let PatientForm = require('../../modals/patientForm')
const path = require('path');
const fs = require('fs');
const users = require('../../modals/users')
const stockTransactions = require('../../modals/stockTransactions')
const multer = require('multer');

// ===== MULTER CONFIGURATION =====
const uploadDir = path.join(__dirname, '../../assets/uploads/documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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
            let result = [];
            if (user.role === 'Admin') {
                result = await stockTransactions.find({ stockOperatorApproval: 'Yes' }).sort({ createdAt: -1 });
            } else if (user.role === 'stock_operator') {
                result = await stockTransactions.find({}).sort({ createdAt: -1 });
            } else {
                result = await stockTransactions.find({
                    $or: [
                        { receiverId: user.userId },
                        { senderId: user.userId },
                        { receiverId: user._id.toString() },
                        { senderId: user._id.toString() }
                    ]
                }).sort({ createdAt: -1 });
            }

            let districtHeads = await users.find({ position: 'District Head' })
            let blocktHeads = await users.find({ position: 'Block Head/City Head' })
            let centreHeads = await users.find({ position: 'Centre Head' })
            let stockOrderUsers = await users.find({ type: 'stockorder' })

            // console.log(districtHeads,blocktHeads,centreHeads);
            res.render('stockTransactions', { applications: result, page: "Stock Transactions", user, districtHeads, blocktHeads, centreHeads, stockOrderUsers });
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
const CommissionHistory = require('../../modals/commissionHistory');
const PayoutRequest = require('../../modals/payoutRequest');

// Helper to distribute 5-level commission when a stock transaction is Paid
async function distributeLevelCommissions(receiverUser, totalStock, transactionId) {
    if (!receiverUser || !totalStock || totalStock <= 0) return;

    // Rates per unit: Level 1 -> 10, Level 2 -> 5, Level 3 -> 3, Level 4 -> 2, Level 5 -> 1
    const levelRates = { 1: 10, 2: 5, 3: 3, 4: 2, 5: 1 };
    let currentChild = receiverUser;
    let visited = new Set();
    visited.add(receiverUser._id.toString());

    for (let level = 1; level <= 5; level++) {
        let parentQuery = [];
        if (currentChild.parentUser) {
            parentQuery.push({ _id: currentChild.parentUser });
        }
        if (currentChild.referredBy) {
            parentQuery.push({ userId: currentChild.referredBy });
            parentQuery.push({ referralCode: currentChild.referredBy });
        }

        if (parentQuery.length === 0) break;

        let parent = await users.findOne({
            _id: { $nin: Array.from(visited).map(id => new mongoose.Types.ObjectId(id)) },
            $or: parentQuery
        });

        if (!parent) break;

        visited.add(parent._id.toString());

        const rate = levelRates[level];
        const commissionAmount = totalStock * rate;

        // 1. Increment parent's platform wallet
        await users.updateOne(
            { _id: parent._id },
            { $inc: { platformWalletAmount: commissionAmount } }
        );

        // 2. Record in Commission History
        await CommissionHistory.create({
            recipientId: parent._id,
            recipientUserId: parent.userId || '',
            recipientName: parent.name,
            fromUserId: receiverUser._id,
            fromUserDisplayId: receiverUser.userId || '',
            fromUserName: receiverUser.name,
            fromUserPosition: receiverUser.position,
            transactionId: transactionId,
            level: level,
            stockCount: totalStock,
            ratePerStock: rate,
            commissionAmount: commissionAmount,
            status: 'Credited'
        });

        currentChild = parent;
    }
}

router.post('/newstocktransaction', upload.single('paymentReceipt'), async (req, res) => {
    // const session = await mongoose.startSession();
    // session.startTransaction();
    try {
        let {
            receiverId,
            totalAmount,
            paymentStatus,
            paymentMethod,
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

        if (Array.isArray(receiverId)) {
            receiverId = receiverId[0];
        }



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

        // Robust sender lookup - handle string or ObjectId in session
        let senderQuery;
        try {
            senderQuery = { _id: new mongoose.Types.ObjectId(req.session.userId) };
        } catch (e) {
            senderQuery = { userId: req.session.userId };
        }
        let loggedInUser = await users.findOne(senderQuery);
        if (!loggedInUser) {
            loggedInUser = await users.findOne({ userId: String(req.session.userId) });
        }

        let receiverQuery = { userId: String(receiverId).trim() };
        if (mongoose.Types.ObjectId.isValid(receiverId)) {
            receiverQuery = { $or: [{ userId: String(receiverId).trim() }, { _id: receiverId }] };
        }
        let receiver = await users.findOne(receiverQuery);

        let sender = loggedInUser;
        let skipSenderStockDecrease = false;

        if (loggedInUser && loggedInUser.type === 'stockorder') {
            skipSenderStockDecrease = true;
            let adminUser = await users.findOne({ role: 'Admin' });
            if (adminUser) {
                sender = adminUser;
            }
        } else if (sender && receiver && sender._id.toString() === receiver._id.toString()) {
            skipSenderStockDecrease = true;
        }

        console.log('Sender:', sender ? sender.name : 'NULL', '| Receiver:', receiver ? receiver.name : 'NULL', '| receiverId sent:', receiverId);

        if (!sender || !receiver) {
            throw new Error(`Sender or Receiver not found. Sender: ${sender ? 'OK' : 'MISSING (sessionId: ' + req.session.userId + ')'}, Receiver: ${receiver ? 'OK' : 'MISSING (receiverId: ' + receiverId + ')'}`);
        }

        // 🔹 Get stock documents
        let senderStock = await stock.findOne({ userId: sender._id })
        let receiverStock = await stock.findOne({ userId: receiver._id })

        if (!senderStock) {
            senderStock = new stock({ userId: sender._id, totalStock: 0, OrthoCare: 0, DetoxCare: 0, ParentsWellnessCare: 0, ImmunityBoosterCare: 0, DiabetesCare: 0, HeartCare: 0, DigestiveCare: 0, EyeCare: 0, WeightLossCare: 0, EnergyAndWeaknessCare: 0, HairCare: 0, SkinCare: 0, ThyroidCare: 0, LiverAndKidneyCare: 0, LadiesWellnessCare: 0, InfinityMaleWellness: 0, InfinityFemaleWellness: 0, PilesCare: 0, AsthmaCare: 0, NeuroCare: 0, BloodPurifierCare: 0, BrainAndMemoryCare: 0, PowerWellnessCare: 0, TotalWellnessCare: 0 });
            await senderStock.save();
        }

        if (!receiverStock) {
            receiverStock = new stock({ userId: receiver._id, totalStock: 0, OrthoCare: 0, DetoxCare: 0, ParentsWellnessCare: 0, ImmunityBoosterCare: 0, DiabetesCare: 0, HeartCare: 0, DigestiveCare: 0, EyeCare: 0, WeightLossCare: 0, EnergyAndWeaknessCare: 0, HairCare: 0, SkinCare: 0, ThyroidCare: 0, LiverAndKidneyCare: 0, LadiesWellnessCare: 0, InfinityMaleWellness: 0, InfinityFemaleWellness: 0, PilesCare: 0, AsthmaCare: 0, NeuroCare: 0, BloodPurifierCare: 0, BrainAndMemoryCare: 0, PowerWellnessCare: 0, TotalWellnessCare: 0 });
            await receiverStock.save();
        }

        // // 🔴 Check if sender has enough stock
        // if (senderStock.totalStock < totalStock) {
        //     throw new Error('Insufficient stock');
        // }

        // 🔻 Decrease sender stock
        if (!skipSenderStockDecrease) {
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
        }

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

        let paymentReceipt = req.file ? `/uploads/receipt/${req.file.filename}` : null;

        // 🧾 Save transaction record
        let newTransaction = new stockTransactions({
            receiverId: receiver.userId || receiver._id.toString(),
            receiverName: receiver.name,
            receiverPosition: receiver.position,
            senderId: sender.userId || sender._id.toString(),
            senderName: sender.name,
            senderPosition: sender.position,
            totalStock,
            totalAmount,
            paymentStatus,
            paymentMethod,
            paymentReceipt,
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

        let commissionDistributed = false;
        newTransaction.commissionDistributed = commissionDistributed;

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

// GET single stock transaction details for edit modal
router.get('/transaction/:id', async (req, res) => {
    try {
        const transaction = await stockTransactions.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }
        res.json({ success: true, data: transaction });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/editstocktransaction/:id', upload.single('paymentReceipt'), async (req, res) => {
    try {
        let { id } = req.params;
        let updateData = req.body;

        const existingTransaction = await stockTransactions.findById(id);
        if (!existingTransaction) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }



        // If a new receipt was uploaded, update the path
        if (req.file) {
            updateData.paymentReceipt = `/uploads/receipt/${req.file.filename}`;
        }

        // Convert numeric fields
        const numericFields = [
            'totalStock', 'totalAmount', 'OrthoCare', 'DetoxCare', 'ParentsWellnessCare',
            'ImmunityBoosterCare', 'DiabetesCare', 'HeartCare', 'DigestiveCare', 'EyeCare',
            'WeightLossCare', 'EnergyAndWeaknessCare', 'HairCare', 'SkinCare', 'ThyroidCare',
            'LiverAndKidneyCare', 'LadiesWellnessCare', 'InfinityMaleWellness',
            'InfinityFemaleWellness', 'PilesCare', 'AsthmaCare', 'NeuroCare',
            'BloodPurifierCare', 'BrainAndMemoryCare', 'PowerWellnessCare', 'TotalWellnessCare'
        ];
        
        numericFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateData[field] = Number(updateData[field]) || 0;
            }
        });

        // Sync receiver info if receiverId is updated
        let targetReceiverId = updateData.receiverId || existingTransaction.receiverId;
        let receiverQuery = { userId: targetReceiverId };
        if (mongoose.Types.ObjectId.isValid(targetReceiverId)) {
            receiverQuery = { $or: [{ userId: targetReceiverId }, { _id: targetReceiverId }] };
        }
        let receiver = await users.findOne(receiverQuery);
        if (receiver) {
            updateData.receiverId = receiver.userId || receiver._id.toString();
            updateData.receiverName = receiver.name;
            updateData.receiverPosition = receiver.position;
        }

        // Stock adjustment between sender and receiver
        const careFields = [
            'OrthoCare', 'DetoxCare', 'ParentsWellnessCare', 'ImmunityBoosterCare',
            'DiabetesCare', 'HeartCare', 'DigestiveCare', 'EyeCare', 'WeightLossCare',
            'EnergyAndWeaknessCare', 'HairCare', 'SkinCare', 'ThyroidCare',
            'LiverAndKidneyCare', 'LadiesWellnessCare', 'InfinityMaleWellness',
            'InfinityFemaleWellness', 'PilesCare', 'AsthmaCare', 'NeuroCare',
            'BloodPurifierCare', 'BrainAndMemoryCare', 'PowerWellnessCare', 'TotalWellnessCare'
        ];

        let senderQuery = { userId: existingTransaction.senderId };
        if (mongoose.Types.ObjectId.isValid(existingTransaction.senderId)) {
            senderQuery = { $or: [{ userId: existingTransaction.senderId }, { _id: existingTransaction.senderId }] };
        }
        let sender = await users.findOne(senderQuery);

        let oldReceiverQuery = { userId: existingTransaction.receiverId };
        if (mongoose.Types.ObjectId.isValid(existingTransaction.receiverId)) {
            oldReceiverQuery = { $or: [{ userId: existingTransaction.receiverId }, { _id: existingTransaction.receiverId }] };
        }
        let oldReceiver = await users.findOne(oldReceiverQuery);

        if (sender && receiver) {
            let sameReceiver = oldReceiver && oldReceiver._id.toString() === receiver._id.toString();
            let senderInc = {};
            let receiverInc = {};
            let oldReceiverInc = {};

            let newTotalStock = updateData.totalStock !== undefined ? updateData.totalStock : (existingTransaction.totalStock || 0);
            let totalStockDiff = newTotalStock - (existingTransaction.totalStock || 0);
            senderInc.totalStock = -totalStockDiff;

            if (sameReceiver) {
                receiverInc.totalStock = totalStockDiff;
                careFields.forEach(f => {
                    let oldVal = existingTransaction[f] || 0;
                    let newVal = updateData[f] !== undefined ? updateData[f] : oldVal;
                    let diff = newVal - oldVal;
                    senderInc[f] = -diff;
                    receiverInc[f] = diff;
                });
                await stock.updateOne({ userId: receiver._id }, { $inc: receiverInc });
            } else {
                if (oldReceiver) {
                    oldReceiverInc.totalStock = -(existingTransaction.totalStock || 0);
                    careFields.forEach(f => {
                        oldReceiverInc[f] = -(existingTransaction[f] || 0);
                    });
                    await stock.updateOne({ userId: oldReceiver._id }, { $inc: oldReceiverInc });
                }

                receiverInc.totalStock = newTotalStock;
                careFields.forEach(f => {
                    let oldVal = existingTransaction[f] || 0;
                    let newVal = updateData[f] !== undefined ? updateData[f] : oldVal;
                    senderInc[f] = -(newVal - oldVal);
                    receiverInc[f] = newVal;
                });
                await stock.updateOne({ userId: receiver._id }, { $inc: receiverInc }, { upsert: true });
            }

            await stock.updateOne({ userId: sender._id }, { $inc: senderInc });
        }

        const updatedTransaction = await stockTransactions.findByIdAndUpdate(id, updateData, { new: true });

        res.json({ success: true, data: updatedTransaction });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET Commission History Page
router.get('/commissionhistory', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }

    try {
        let user = await users.findOne({ _id: req.session.userId });
        if (!user) {
            return res.redirect('/auth/login');
        }

        let query = {};
        if (user.role === 'Admin') {
            query = {};
        } else {
            query = { recipientId: user._id };
        }

        const history = await CommissionHistory.find(query).sort({ createdAt: -1 });

        const totalEarned = history.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
        const totalStockCredited = history.reduce((sum, c) => sum + (c.stockCount || 0), 0);

        res.render('stockOrder/commissionHistory', {
            user,
            page: "Commission History",
            history,
            totalEarned,
            totalStockCredited,
            platformWalletAmount: user.platformWalletAmount || 0
        });
    } catch (error) {
        console.error("Error loading commission history:", error);
        res.status(500).send("Error loading commission history.");
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

        if (Array.isArray(receiverId)) {
            receiverId = receiverId[0];
        }


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







router.post('/toggleapproval', async (req, res) => {
    try {
        const { id, type } = req.body;
        const transaction = await stockTransactions.findById(id);
        if (!transaction) return res.status(404).json({ success: false, message: "Transaction not found" });

        if (type === 'stockOperator') {
            const newStatus = transaction.stockOperatorApproval === 'Yes' ? 'No' : 'Yes';
            await stockTransactions.findByIdAndUpdate(id, { stockOperatorApproval: newStatus });
            return res.json({ success: true, message: "Stock Operator Approval updated to " + newStatus });
        } else if (type === 'admin') {
            const newStatus = transaction.adminApproval === 'Yes' ? 'No' : 'Yes';
            let updates = { adminApproval: newStatus };
            
            console.log("=== ADMIN APPROVAL DEBUG ===");
            console.log("Transaction ID:", id);
            console.log("New Admin Status:", newStatus);
            console.log("Receiver ID from transaction:", transaction.receiverId);
            console.log("Total Stock:", transaction.totalStock);
            console.log("Commission Already Distributed:", transaction.commissionDistributed);
            
            // Distribute commission when admin approves
            if (newStatus === 'Yes' && !transaction.commissionDistributed) {
                let receiverQuery = [];
                if (transaction.receiverId) {
                    if (mongoose.Types.ObjectId.isValid(transaction.receiverId)) {
                        receiverQuery.push({ _id: transaction.receiverId });
                    }
                    receiverQuery.push({ userId: transaction.receiverId });
                }
                
                console.log("Receiver Query:", JSON.stringify(receiverQuery));
                
                if (receiverQuery.length === 0) {
                    console.log("ERROR: No receiver query could be built - receiverId is empty");
                } else {
                    const receiver = await users.findOne({ $or: receiverQuery });
                    console.log("Receiver Found:", receiver ? receiver.name : "NOT FOUND");
                    
                    if (receiver) {
                        console.log("Receiver parentUser:", receiver.parentUser);
                        console.log("Receiver referredBy:", receiver.referredBy);
                    }
                    
                    if (transaction.totalStock > 0 && receiver) {
                        try {
                            console.log("Calling distributeLevelCommissions...");
                            await distributeLevelCommissions(receiver, transaction.totalStock, transaction._id);
                            updates.commissionDistributed = true;
                            console.log("Commission distributed successfully!");
                        } catch (commErr) {
                            console.error("Commission Distribution Error:", commErr.message);
                            console.error("Full Error:", commErr);
                        }
                    } else {
                        console.log("Skipping commission: totalStock =", transaction.totalStock, "receiver =", !!receiver);
                    }
                }
            }
            
            console.log("Updates to save:", JSON.stringify(updates));
            console.log("=== END DEBUG ===");
            
            await stockTransactions.findByIdAndUpdate(id, updates);
            return res.json({ success: true, message: "Admin Approval updated to " + newStatus });
        } else {
            return res.status(400).json({ success: false, message: "Invalid approval type" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


router.delete('/deletestocktransaction/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await stockTransactions.findByIdAndDelete(id);
        if (!transaction) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }
        res.json({ success: true, message: "Transaction deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// --- PAYOUT ROUTES ---

// GET user payouts page
router.get('/payouts', async (req, res) => {
    if (!req.session.userId) return res.redirect('/auth/login');
    
    try {
        const user = await users.findById(req.session.userId);
        if (!user) return res.redirect('/auth/login');

        // Fetch user's commission history
        const commissions = await CommissionHistory.find({ recipientId: user._id });

        // Group earnings by month (e.g. '2026-01')
        const currentDate = new Date();
        const currentMonthString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        const earningsByMonth = {
            [currentMonthString]: 0
        };
        
        commissions.forEach(c => {
            const date = new Date(c.createdAt);
            const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!earningsByMonth[month]) earningsByMonth[month] = 0;
            earningsByMonth[month] += (c.commissionAmount || 0);
        });

        // Fetch user's payout requests
        const payoutRequests = await PayoutRequest.find({ userId: user._id }).sort({ createdAt: -1 });

        res.render('stockOrder/payouts', {
            page: 'Payouts',
            user,
            earningsByMonth,
            payoutRequests
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading payouts.");
    }
});

// POST request payout
router.post('/request-payout', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    try {
        const { month, amount } = req.body;
        const requestedAmount = Number(amount);

        if (!month || isNaN(requestedAmount) || requestedAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid request parameters.' });
        }

        const user = await users.findById(req.session.userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        if (user.kycStatus !== 'Approved') {
            return res.status(403).json({ success: false, message: 'Your payment KYC is not approved by admin.' });
        }

        // Check if a payout for this month has already been requested
        const existingRequestForMonth = await PayoutRequest.findOne({ userId: user._id, month });
        if (existingRequestForMonth) {
            return res.status(400).json({ success: false, message: 'Payout for this month has already been requested.' });
        }

        // Check daily limit
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todayRequests = await PayoutRequest.find({
            userId: user._id,
            requestedAt: { $gte: startOfDay, $lte: endOfDay }
        });

        const todayTotalRequested = todayRequests.reduce((sum, req) => sum + req.amount, 0);
        if (todayTotalRequested + requestedAmount > 5000) {
            return res.status(400).json({ success: false, message: `Daily payout request limit is 5000 rupees. You have already requested ${todayTotalRequested} rupees today.` });
        }

        // Verify the amount does not exceed earnings for that month
        const commissions = await CommissionHistory.find({ recipientId: user._id });
        let monthEarnings = 0;
        commissions.forEach(c => {
            const date = new Date(c.createdAt);
            const m = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (m === month) {
                monthEarnings += (c.commissionAmount || 0);
            }
        });

        if (requestedAmount > monthEarnings) {
            return res.status(400).json({ success: false, message: 'Requested amount exceeds earnings for the selected month.' });
        }

        const newRequest = new PayoutRequest({
            userId: user._id,
            amount: requestedAmount,
            month
        });
        await newRequest.save();

        res.json({ success: true, message: 'Payout requested successfully.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET Admin payouts page
router.get('/admin/payouts', async (req, res) => {
    if (!req.session.userId) return res.redirect('/auth/login');
    
    try {
        const user = await users.findById(req.session.userId);
        if (!user || user.role !== 'Admin') return res.redirect('/auth/login');

        const payoutRequests = await PayoutRequest.find()
            .populate('userId')
            .sort({ createdAt: -1 });

        res.render('adminPayouts', {
            page: 'Review Payouts',
            user,
            payoutRequests
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading admin payouts.");
    }
});

// POST Admin update payout status
router.post('/admin/payouts/:id', upload.single('paymentReceipt'), async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    try {
        const user = await users.findById(req.session.userId);
        if (!user || user.role !== 'Admin') return res.status(403).json({ success: false, message: 'Forbidden' });

        const { status } = req.body;
        const updateData = { status };

        if (status === 'Completed') {
            updateData.completedAt = new Date();
            if (req.file) {
                updateData.paymentReceipt = `/uploads/receipt/${req.file.filename}`;
            }
            // Subtract from user's platformWalletAmount
            const payoutRequest = await PayoutRequest.findById(req.params.id);
            if (payoutRequest && payoutRequest.status !== 'Completed') {
                await users.findByIdAndUpdate(payoutRequest.userId, {
                    $inc: { platformWalletAmount: -(payoutRequest.amount + 101) }
                });
            }
        }

        await PayoutRequest.findByIdAndUpdate(req.params.id, updateData);

        res.json({ success: true, message: 'Payout status updated.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
