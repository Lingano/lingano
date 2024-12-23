import React, { useState } from "react";
import styles from "./ArrangeQuestion.module.css";

interface ArrangeQuestionProps {
    sentence: string;
    words: string[];
    setWords: (newWords: string[]) => void;
    sentenceTranslated: string;
    correctness: "" | "correct" | "incorrect";
    setCorrectness: (c: "correct" | "incorrect") => void;
}

const ArrangeQuestion: React.FC<ArrangeQuestionProps> = ({
    sentence,
    words,
    setWords,
    sentenceTranslated,
    correctness,
    setCorrectness,
}) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDrop = (index: number) => {
        if (draggedIndex === null) return;

        const newWords = [...words];
        const [draggedWord] = newWords.splice(draggedIndex, 1);
        newWords.splice(index, 0, draggedWord);

        setDraggedIndex(null);
        setWords(newWords);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    return (
        <div className={styles.container}>
            <h3>Sentence in the original language:</h3>
            <blockquote>
                <p>{sentence}</p>
            </blockquote>
            <h3>Arrange the words to form the correct translation:</h3>
            <div className={styles.wordsContainer}>
                {words.map((word, index) => (
                    <div
                        key={word + index}
                        className={styles.word}
                        {...(!correctness && {
                            draggable: true,
                            onDragStart: () => handleDragStart(index),
                            onDrop: () => handleDrop(index),
                            onDragOver: handleDragOver,
                        })}
                    >
                        {word}
                    </div>
                ))}
            </div>

            <button
                disabled={!!correctness}
                className={styles.button}
                onClick={() =>
                    setCorrectness(
                        words.join(" ") === sentenceTranslated
                            ? "correct"
                            : "incorrect"
                    )
                }
            >
                Submit
            </button>

            {correctness === "correct" && (
                <p className={styles.correctMessage}>{"Correct! :)"}</p>
            )}
            {correctness === "incorrect" && (
                <>
                    <p className={styles.incorrectMessage}>{"Incorrect :("}</p>
                    <p>{"Correct answer was: " + sentenceTranslated}</p>
                </>
            )}
        </div>
    );
};

export default ArrangeQuestion;
