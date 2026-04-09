const mongoose = require('mongoose');
const SalaryTransaction = require('./src/modals/salary');
const mongoConnect = require('./src/modals/db');

async function checkSalaries() {
    mongoConnect(); // Connect to DB
    
    setTimeout(async () => {
        try {
            const salaries = await SalaryTransaction.find().lean();
            console.log("Salaries in DB:", salaries);
            mongoose.disconnect();
        } catch (e) {
            console.error("Error:", e);
            mongoose.disconnect();
        }
    }, 2000);
}

checkSalaries();
