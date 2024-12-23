import styles from "./ChooseTranslationQuestion.module.css";

interface ChooseTranslationQuestionProps {
    word: string;
    options: string[];
    correctOption: string;
    selectedOption: string;
    setSelectedOption: (newSelectedOption: string) => void;
    correctness: "" | "correct" | "incorrect";
    setCorrectness: (c: "correct" | "incorrect") => void;
}

const ChooseTranslationQuestion: React.FC<ChooseTranslationQuestionProps> = ({
    word,
    options,
    correctOption,
    selectedOption,
    setSelectedOption,
    correctness,
    setCorrectness,
}) => {
    const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedOption(e.target.value);
    };

    return (
        <div className={styles.container}>
            <h3>Choose correct translation for:</h3>
            <p className={styles.originalWord}>“ {word} ”</p>
            <form
                className={styles.form}
                onSubmit={(e) => {
                    e.preventDefault();
                    setCorrectness(
                        selectedOption === correctOption
                            ? "correct"
                            : "incorrect"
                    );
                }}
            >
                {options?.map((option, index) => (
                    <label key={option + index} className={styles.option}>
                        <div className={styles.input}>
                            <input
                                type="radio"
                                value={option}
                                checked={selectedOption === option}
                                onChange={handleOptionChange}
                                disabled={!!correctness}
                            />
                        </div>
                        <div className={styles.optionText}>{option}</div>
                    </label>
                ))}

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
                        <p>{"Correct answer was: " + correctOption}</p>
                    </>
                )}
            </form>
        </div>
    );
};

export default ChooseTranslationQuestion;
