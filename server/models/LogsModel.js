const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    endPoint: {
        type: String,
        required: true,
    },
});

const log = mongoose.model('Log', logSchema);
module.exports = Log;