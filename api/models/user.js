const mongoose = require("mongoose");
// const Preferences = require("./preferences");
// const UserProfile = require("./user_profile");
const userProfileSchema = require("./user_profile");
const preferencesSchema = require("./preferences");
const quizDataSchema = require("./quiz_data");
const savedWordSchema = require("./saved_word");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    readings: [
        {
            owner: {
                type: Boolean,
                required: true,
            },
            reading_internal_id: {
                type: Number,
                required: true,
            },
            reading_progress: {
                quiz: {
                    type: quizDataSchema, // Might be upgradable to a more complex object
                    required: false,
                },
            },
            clicked_words: {
                type: [[Number, Number, Number]],
                required: true,
            },
            reading_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Reading",
                required: true,
            },
        },
    ],
    saved_words: [
        {
            type: savedWordSchema,
            required: false,
        },
    ],
    preferences: {
        type: preferencesSchema,
        required: true,
    },
    profile: {
        type: userProfileSchema,
        required: true,
    },
    premium: {
        type: Boolean,
        required: false,
    },
    god_mode: {
        type: Boolean,
        required: false,
    },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
