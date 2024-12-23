const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
    profile_picture: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: false,
    },
    languages: {
        type: [String],
        required: false,
    },
    location: {
        type: String,
        required: false,
    },
});

// const UserProfile = mongoose.model("UserProfile", userProfileSchema);

module.exports = userProfileSchema;
