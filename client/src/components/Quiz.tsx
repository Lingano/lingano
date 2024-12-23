import React, { useRef, useState } from "react";
import styles from "./Quiz.module.css";
import Question from "./Question";
import { Word } from "../interfaces/Word";
import api from "../utils/api";
import DictionaryQuizToggle from "./DictionaryQuizToggle";
import { QuestionData } from "../interfaces/QuestionData";
import { translate } from "../utils/TranslationAPI";
import { QuizData } from "../interfaces/QuizData";
import { ObjectId } from "mongodb";
import Spinner2 from "./Spinner2";

interface QuizProps {
    onViewChange: (view: "dictionary" | "quiz" | "fullpageQuiz") => void;
    language: string;
    readingId: ObjectId;
    formattedText: Word[][][];
    activeView: "dictionary" | "quiz" | "fullpageQuiz";
    quiz: QuizData | null;
    setQuiz: (newQuiz: QuizData | null) => void;
}

const Quiz: React.FC<QuizProps> = ({
    onViewChange,
    language,
    readingId,
    formattedText,
    activeView,
    quiz,
    setQuiz,
}) => {
    const [quizError, setQuizError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const getNewQuiz = async (numQuestions: number) => {
        setLoading(true);
        setQuiz(null);

        const clickedWords = await api.getClickedWords(readingId);

        // only generate quiz if there are at least 5 unique clicked words
        if (clickedWords.length < 5) {
            setQuizError(
                "Nothing to show, translate some more words and retry later!"
            );
        } else {
            const newQuiz: QuizData = { questions: [], current: 0 };

            // make numQuestions random questions (potentially same words or question types, it's random)
            for (let i = 0; i < numQuestions; ++i) {
                const randomIndex = Math.floor(
                    Math.random() * clickedWords.length
                );
                const randomWord = clickedWords[randomIndex];
                const word =
                    formattedText[randomWord[0]][randomWord[1]][randomWord[2]]
                        .text;
                const sentence = formattedText[randomWord[0]][randomWord[1]]
                    .map((word: Word) => word.prefix + word.text + word.postfix)
                    .join(" ");
                const questionTypes: (
                    | "fill-blank"
                    | "choose-translation"
                    | "arrange"
                )[] = ["fill-blank", "choose-translation"];
                // only add "arrange" to questionTypes if sentence is up to 8 words long
                if (formattedText[randomWord[0]][randomWord[1]].length <= 10)
                    questionTypes.push("arrange");
                const randomQuestionTypeIndex = Math.floor(
                    Math.random() * questionTypes.length
                );
                const type = questionTypes[randomQuestionTypeIndex];
                const newQuestion: QuestionData = {
                    word,
                    sentence,
                    type,
                    correctness: "",
                    userInput: "",
                    wordTranslated: "",
                    options: [],
                    correctOption: "",
                    selectedOption: "",
                    words: [],
                    sentenceTranslated: "",
                };
                if (type === "fill-blank") {
                    const wordTranslated = await translate(
                        language,
                        "en",
                        word
                    );
                    newQuestion.wordTranslated = wordTranslated;
                } else if (type === "choose-translation") {
                    const otherWords = formattedText[randomWord[0]][
                        randomWord[1]
                    ]
                        .map((w) => w.text)
                        .filter((w) => w.toLowerCase() !== word.toLowerCase());
                    const randomOtherWords = otherWords
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 3);

                    const incorrectOptions = await Promise.all(
                        randomOtherWords.map(async (option) => {
                            const translatedOption = await translate(
                                language,
                                "en",
                                option
                            );
                            return translatedOption;
                        })
                    );

                    const correctOption = await translate(language, "en", word);

                    incorrectOptions.push(correctOption);
                    newQuestion.options = incorrectOptions.sort(
                        () => 0.5 - Math.random()
                    );
                    newQuestion.correctOption = correctOption;
                } else if (type === "arrange") {
                    const translation = await translate(
                        language,
                        "en",
                        sentence
                    );
                    newQuestion.sentenceTranslated = translation;

                    const shuffledWords = translation
                        .split(" ")
                        .sort(() => 0.5 - Math.random());
                    newQuestion.words = shuffledWords;
                }

                newQuiz.questions[i] = newQuestion;
            }

            console.log("updating quiz on server");
            api.putQuizData(readingId, newQuiz);

            setQuiz(newQuiz);
        }

        setLoading(false);
    };

    const handleQuestionClick = (index: number) => {
        if (quiz) {
            const newQuiz = { ...quiz, current: index };
            setQuiz(newQuiz);
        }
    };

    const allQuestionsAnswered = quiz?.questions.every(
        (question) => question.correctness !== ""
    );

    return (
        <div
            className={`${
                activeView == "fullpageQuiz" ? styles.fullpageQuiz : styles.quiz
            }`}
        >
            <DictionaryQuizToggle
                activeView={activeView}
                onViewChange={onViewChange}
            />
            <div className={styles.buttons}>
                <button
                    onClick={() => onViewChange("quiz")}
                    className={`${styles.toggleButton} ${
                        activeView === "fullpageQuiz" ? "" : styles.inactive
                    }`}
                >
                    ← Back to Reading
                </button>
                <button
                    className={`${styles.toggleButton} ${
                        activeView === "quiz" ? "" : styles.inactive
                    }`}
                    onClick={() => onViewChange("fullpageQuiz")}
                >
                    Go full page
                </button>
                <button
                    // className={`${styles.toggleButton} ${
                    //     allQuestionsAnswered ? "" : styles.inactive
                    // }`}
                    className={styles.toggleButton}
                    onClick={() => getNewQuiz(5)}
                >
                    Start New Quiz
                </button>
            </div>
            {quiz && (
                <>
                    <ul className={styles.questionList}>
                        {quiz.questions.map((question, index) => {
                            let correctnessClass;
                            if (question.correctness === "correct") {
                                correctnessClass = styles.correct;
                            } else if (question.correctness === "incorrect") {
                                correctnessClass = styles.incorrect;
                            } else {
                                correctnessClass = styles.unanswered;
                            }
                            return (
                                <button
                                    key={JSON.stringify(question) + index}
                                    className={`${styles.questionItem} ${
                                        quiz.current === index
                                            ? styles.active
                                            : ""
                                    } ${correctnessClass}`}
                                    onClick={() => handleQuestionClick(index)}
                                >
                                    {index + 1}
                                </button>
                            );
                        })}
                    </ul>

                    <Question
                        question={quiz.questions[quiz.current]}
                        updateCurrentQuestion={(
                            updatedQuestion: QuestionData,
                            submitUpdateToServer: boolean
                        ) => {
                            const updatedQuiz: QuizData = {
                                ...quiz,
                                questions: [...quiz.questions],
                            };
                            updatedQuiz.questions[quiz.current] =
                                updatedQuestion;

                            if (submitUpdateToServer) {
                                console.log(
                                    "updating submitted question on server"
                                );
                                api.updateQuizQuestion(
                                    readingId,
                                    quiz.current,
                                    updatedQuestion
                                );
                            }
                            setQuiz(updatedQuiz);
                        }}
                    ></Question>
                </>
            )}
            {!quiz && !loading && (
                <>
                    {/* <button
                        onClick={() => getNewQuiz(5)}
                        className={`${styles.toggleButton} ${styles.startButton}`}
                    >
                        Start Quiz
                    </button> */}
                    {quizError && <p>{quizError}</p>}
                </>
            )}
            {!quiz && loading && <Spinner2 />}
        </div>
    );
};

export default Quiz;
