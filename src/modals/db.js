let mongoose = require('mongoose')

function mongoConnect() {
    mongoose.connect('mongodb://admin:BSRFvps1234@72.60.101.162:27017/parceldb?authSource=admin')
        .then(() => {
            console.log("MongoDB Connected");
        })
        .catch((err) => {
            console.log(err);

        })
}

module.exports = mongoConnect