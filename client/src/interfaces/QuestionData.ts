export interface QuestionData {
    type: "fill-blank" | "choose-translation" | "arrange";
    word: string; // all question types
    sentence: string; // all question types
    correctness: "" | "correct" | "incorrect"; // all question types
    userInput: string; // FillBlankQuestion
    wordTranslated: string; // FillBlankQuestion
    options: string[]; // ChooseTranslationQuestion
    correctOption: string; // ChooseTranslationQuestion
    selectedOption: string; // ChooseTranslationQuestion
    words: string[]; // ArrangeQuestion
    sentenceTranslated: string; // ArrangeQuestion
}
