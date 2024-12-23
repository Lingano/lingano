const mongoose = require("mongoose");

const savedWordSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    meaning: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    knowledge_level: {
        type: Number,
        required: true,
    },
    interval: {
        type: Number,
        required: true,
    },
    easinessFactor: {
        type: Number,
        required: true,
    },
    repetitions: {
        type: Number,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    lastReviewed: {
        type: Date,
        required: true,
    },
    location: {
        type: Array,
        required: false,
    },
    from_reading: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reading",
        required: false,
    },
    favourite: {
        type: Boolean,
        required: true,
    },
});

module.exports = savedWordSchema;
