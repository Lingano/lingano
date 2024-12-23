const mongoose = require("mongoose");

const readingSchema = new mongoose.Schema({
    internal_user_id: { type: Number, required: true },
    owner: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    owner_name: { type: String, required: true },
    users: [
        {
            user_id: {
                type: mongoose.Types.ObjectId,
                ref: "User",
                required: true,
            },
            reading_internal_id: { type: Number, required: true },
        },
    ],
    title: { type: String, required: true },
    category: { type: String, required: true },
    text: { type: String, required: true },
    formatted_text: {
        type: Array,
        required: true,
    },
    translation_cache: [[{ type: String, required: false, default: null }]],
    language: { type: String, required: true },
    public_access: { type: Boolean, required: true },
});

const Reading = mongoose.model("Reading", readingSchema);

module.exports = Reading;
