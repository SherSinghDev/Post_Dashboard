let mongoose = require('mongoose')

function mongoConnect() {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/parceldb";
    mongoose.connect(mongoUri)
        .then(() => {
            console.log("MongoDB Connected Successfully to " + mongoUri);
        })
        .catch((err) => {
            console.log("MongoDB Connection Error:", err);
        })
}

module.exports = mongoConnect