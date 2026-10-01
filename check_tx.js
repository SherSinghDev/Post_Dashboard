const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect("mongodb+srv://devendracoder2023:tAStB869w2yKqH3K@cluster0.p75ms.mongodb.net/test?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const stockTransactions = require('./src/modals/stockTransactions');

async function check() {
    try {
        const t = await stockTransactions.findOne().sort({ createdAt: -1 });
        console.log("Transaction:");
        console.log("adminApproval:", t.adminApproval);
        console.log("commissionDistributed:", t.commissionDistributed);
        console.log("totalStock:", t.totalStock);
        console.log("receiverId:", t.receiverId);
    } catch(e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}
check();
