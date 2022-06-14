const mongoose = require('mongoose');

const Users = mongoose.model('User', new mongoose.Schema({
    id: String,
    words: [{
        word: String,
        guesses: [String],
        results: [String],
        completed: Boolean,
        usedHint: Boolean,
    }],
    correct: Number,
    incorrect: Number,
}));

module.exports = { Users };