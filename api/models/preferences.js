const mongoose = require("mongoose");

const preferencesSchema = new mongoose.Schema({
    theme: { type: String, enum: ["light", "dark"], required: false },
    language: {
        type: String,
        enum: ["English", "Spanish", "Italian", "French", "German"],
        required: false,
    },
    notificationsEnabled: { type: Boolean, required: false },
    privacy: {
        profileVisibility: {
            type: String,
            enum: ["public", "friends_only", "private"],
            required: false,
        },
    },
});

// const Preferences = mongoose.model("Preferences", preferencesSchema);

// module.exports = Preferences;
module.exports = preferencesSchema;
