import React, { useEffect, useRef } from "react";
import styles from "./FillBlankQuestion.module.css";

interface FillBlankQuestionProps {
    sentence: string;
    word: string;
    wordTranslated: string;
    userInput: string;
    setUserInput: (newInput: string) => void;
    correctness: "" | "correct" | "incorrect";
    setCorrectness: (c: "correct" | "incorrect") => void;
}

const FillBlankQuestion: React.FC<FillBlankQuestionProps> = ({
    sentence,
    word,
    wordTranslated,
    userInput,
    setUserInput,
    correctness,
    setCorrectness,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, []);

    const sentenceWithBlank = sentence.replace(word, "_____");

    return (
        <div className={styles.container}>
            <h3>Sentence in the original language:</h3>
            <blockquote className={styles.sentence}>
                <p>{sentenceWithBlank}</p>
            </blockquote>
            <p className={styles.description}>Missing word: {wordTranslated}</p>
            <h3>Type the missing word in the original language:</h3>
            <form
                className={styles.form}
                onSubmit={(e) => {
                    e.preventDefault();
                    setCorrectness(
                        userInput.toLowerCase() === word.toLowerCase()
                            ? "correct"
                            : "incorrect"
                    );
                }}
            >
                <input
                    ref={inputRef}
                    type="text"
                    className={styles.input}
                    value={userInput}
                    onChange={() => {
                        if (inputRef.current)
                            setUserInput(inputRef.current.value);
                    }}
                    disabled={!!correctness}
                />

                <button
                    type="submit"
                    disabled={!!correctness}
                    className={styles.button}
                >
                    Submit
                </button>

                {correctness === "correct" && (
                    <p className={styles.correctMessage}>{"Correct! :)"}</p>
                )}
                {correctness === "incorrect" && (
                    <>
                        <p className={styles.incorrectMessage}>
                            {"Incorrect :("}
                        </p>
                        <p>{"Correct answer was: " + word}</p>
                    </>
                )}
            </form>
        </div>
    );
};

export default FillBlankQuestion;
