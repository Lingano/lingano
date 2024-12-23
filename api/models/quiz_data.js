const mongoose = require("mongoose");

const quizDataSchema = new mongoose.Schema({
    questions: [
        {
            type: {
                type: String,
                enum: ["fill-blank", "choose-translation", "arrange"],
                required: true,
            },
            word: { type: String, required: true }, // all question types
            sentence: { type: String, required: true }, // all question types
            correctness: {
                type: String,
                enum: ["", "correct", "incorrect"],
                required: true,
            }, // all question types
            userInput: { type: String }, // FillBlankQuestion
            wordTranslated: { type: String }, // FillBlankQuestion
            options: { type: [String] }, // ChooseTranslationQuestion
            correctOption: { type: String }, // ChooseTranslationQuestion
            selectedOption: { type: String }, // ChooseTranslationQuestion
            words: { type: [String] }, // ArrangeQuestion
            sentenceTranslated: { type: String }, // ArrangeQuestion
        },
    ],
    current: {
        type: Number,
        required: true,
    },
});

// const QuizData = mongoose.model("QuizData", quizDataSchema);

module.exports = quizDataSchema;
