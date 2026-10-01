const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect("mongodb+srv://devendracoder2023:tAStB869w2yKqH3K@cluster0.p75ms.mongodb.net/database_name?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const stockTransactions = require('./src/modals/stockTransactions');
const users = require('./src/modals/users');

async function test() {
    try {
        const transaction = await stockTransactions.findOne().sort({ createdAt: -1 });
        console.log("Latest Transaction:", transaction._id, "receiverId:", transaction.receiverId);
        
        // Attempt query
        let receiver;
        try {
            receiver = await users.findOne({ $or: [{ userId: transaction.receiverId }, { _id: transaction.receiverId }] });
            console.log("Receiver found:", receiver ? receiver._id : "null");
        } catch (e) {
            console.log("Query Error:", e.message);
            // Let's try only userId
            receiver = await users.findOne({ userId: transaction.receiverId });
            console.log("Receiver found by userId only:", receiver ? receiver._id : "null");
        }
        
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}
test();
