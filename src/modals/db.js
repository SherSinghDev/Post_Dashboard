require('dotenv').config()
const dns = require('dns')
let mongoose = require('mongoose')

// Set DNS servers to avoid querySrv ECONNREFUSED issues on local networks/ISPs with SRV records
try {
    dns.setServers(['8.8.8.8', '1.1.1.1', ...dns.getServers()]);
} catch (e) {
    // Ignore if not supported
}

function mongoConnect() {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/parceldb";
    mongoose.connect(mongoUri)
        .then(() => {
            console.log("MongoDB Connected Successfully");
        })
        .catch((err) => {
            console.log("MongoDB Connection Error:", err);
        })
}

module.exports = mongoConnect