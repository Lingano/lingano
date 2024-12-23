import React from "react";
import styles from "./DictionaryQuizToggle.module.css";

interface DictionaryQuizToggleProps {
    activeView: "dictionary" | "quiz" | "fullpageQuiz";
    onViewChange: (view: "dictionary" | "quiz") => void;
}

const DictionaryQuizToggle: React.FC<DictionaryQuizToggleProps> = ({
    activeView,
    onViewChange,
}) => {
    return (
        <div
            className={`${
                activeView === "fullpageQuiz"
                    ? styles.headerFullpageQuiz
                    : styles.headerQuiz
            }`}
        >
            <div
                className={`${styles.dictionaryLink} ${
                    activeView === "dictionary" ? styles.active : ""
                }`}
                onClick={() => onViewChange("dictionary")}
            >
                <a href="#">Dictionary</a>
            </div>

            <div
                className={`${styles.quizesLink} ${
                    activeView === "quiz" || activeView === "fullpageQuiz"
                        ? styles.active
                        : ""
                }`}
                onClick={() => onViewChange("quiz")}
            >
                <a href="#">Quizzes</a>
            </div>
        </div>
    );
};

export default DictionaryQuizToggle;
