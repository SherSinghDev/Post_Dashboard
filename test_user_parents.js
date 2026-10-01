const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://sherpost:FelisLeoMongo@cluster0.ma4tnzs.mongodb.net/parceldb?appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const stockTransactions = require('./src/modals/stockTransactions');
const users = require('./src/modals/users');

async function test() {
    try {
        const tx = await stockTransactions.findOne().sort({ createdAt: -1 });
        if (!tx) {
            console.log("No transactions found.");
            return;
        }
        console.log("Latest Tx ID:", tx._id);
        console.log("Receiver ID (from Tx):", tx.receiverId);
        console.log("Total Stock:", tx.totalStock);
        console.log("Commission Distributed:", tx.commissionDistributed);
        console.log("Admin Approval:", tx.adminApproval);

        let receiverQuery = [];
        if (mongoose.Types.ObjectId.isValid(tx.receiverId)) {
            receiverQuery.push({ _id: tx.receiverId });
        }
        receiverQuery.push({ userId: tx.receiverId });

        const receiver = await users.findOne({ $or: receiverQuery });
        if (!receiver) {
            console.log("Receiver not found in users collection.");
            return;
        }

        console.log("Receiver User ID:", receiver.userId);
        console.log("Receiver Name:", receiver.name);
        console.log("Receiver Type:", receiver.type);
        console.log("Receiver Role:", receiver.role);
        console.log("Receiver parentUser:", receiver.parentUser);
        console.log("Receiver referredBy:", receiver.referredBy);

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}
test();
