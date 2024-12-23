import FillBlankQuestion from "./FillBlankQuestion";
import ChooseTranslationQuestion from "./ChooseTranslationQuestion";
import ArrangeQuestion from "./ArrangeQuestion";
import { QuestionData } from "../interfaces/QuestionData";

interface QuestionProps {
    question: QuestionData;
    updateCurrentQuestion: (
        updatedQuestion: QuestionData,
        submitUpdateToServer: boolean
    ) => void;
}

const Question = ({ question, updateCurrentQuestion }: QuestionProps) => {
    if (question.type === "fill-blank")
        return (
            <FillBlankQuestion
                key={JSON.stringify(question)}
                word={question.word}
                wordTranslated={question.wordTranslated}
                sentence={question.sentence}
                userInput={question.userInput}
                setUserInput={(userInput: string) => {
                    updateCurrentQuestion(
                        {
                            ...question,
                            userInput,
                        },
                        false
                    );
                }}
                correctness={question.correctness}
                setCorrectness={(correctness: "correct" | "incorrect") => {
                    updateCurrentQuestion(
                        {
                            ...question,
                            correctness,
                        },
                        true
                    );
                }}
            />
        );
    else if (question.type === "choose-translation")
        return (
            <ChooseTranslationQuestion
                key={JSON.stringify(question)}
                word={question.word}
                options={question.options}
                correctOption={question.correctOption}
                selectedOption={question.selectedOption}
                setSelectedOption={(selectedOption: string) => {
                    updateCurrentQuestion(
                        {
                            ...question,
                            selectedOption,
                        },
                        false
                    );
                }}
                correctness={question.correctness}
                setCorrectness={(correctness: "correct" | "incorrect") => {
                    updateCurrentQuestion(
                        {
                            ...question,
                            correctness,
                        },
                        true
                    );
                }}
            />
        );
    else if (question.type === "arrange")
        return (
            <ArrangeQuestion
                key={JSON.stringify(question)}
                sentence={question.sentence}
                words={question.words}
                setWords={(words: string[]) => {
                    updateCurrentQuestion(
                        {
                            ...question,
                            words,
                        },
                        false
                    );
                }}
                sentenceTranslated={question.sentenceTranslated}
                correctness={question.correctness}
                setCorrectness={(correctness: "correct" | "incorrect") => {
                    updateCurrentQuestion(
                        {
                            ...question,
                            correctness,
                        },
                        true
                    );
                }}
            />
        );
};

export default Question;
