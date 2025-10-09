let mongoose = require('mongoose')

function mongoConnect() {
    mongoose.connect('mongodb://127.0.0.1:27017/parceldb')
        .then(() => {
            console.log("MongoDB Connected");
        })
        .catch((err) => {
            console.log(err);

        })
}

module.exports = mongoConnect