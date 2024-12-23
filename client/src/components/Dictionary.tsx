import styles from "./Dictionary.module.css";
import DictionaryQuizToggle from "./DictionaryQuizToggle";
import SaveButton from "./SaveButton";
import SpeakerButton from "./PronounceButton";

interface DictionaryProps {
    word: string;
    sentence: string;
    wordTranslated: string;
    sentenceTranslated: string;
    language: string;
    onViewChange: (view: "dictionary" | "quiz") => void;
    onSaveWord: () => void;
    colors: string[];
}

const Dictionary = ({
    word,
    sentence,
    wordTranslated,
    sentenceTranslated,
    language,
    onViewChange,
    onSaveWord,
    colors,
}: DictionaryProps) => {
    const pronounce = (text: string) => {
        const synth = window.speechSynthesis;
        const utterThis = new SpeechSynthesisUtterance(text);
        utterThis.lang = language;
        synth.speak(utterThis);
    };

    return (
        <div className={styles.dictionary}>
            {/* header consists of the links to switch between quiz/dictionary */}
            <DictionaryQuizToggle
                activeView="dictionary"
                onViewChange={onViewChange}
            />
            {/* body consists of the the content of the dictionary */}
            <div className={styles.body}>
                {word && sentence ? (
                    <>
                        <h2>Word</h2>
                        <div className={styles.wordsWrapper}>
                            <div className={styles.firstWord}>
                                <SpeakerButton
                                    key={"Speaker" + word}
                                    onClick={() => pronounce(word)}
                                />
                                <p style={{ backgroundColor: colors[0] }}>
                                    {word}
                                </p>
                                <SaveButton
                                    key={"Save" + word}
                                    onActivate={onSaveWord}
                                ></SaveButton>
                            </div>
                            <div className={styles.secondWord}>
                                <p>{wordTranslated}</p>
                            </div>
                        </div>

                        <h2>Sentence</h2>
                        <div className={styles.sentencesWrapper}>
                            <div>
                                <p style={{ backgroundColor: colors[1] }}>
                                    {sentence}
                                </p>
                            </div>
                            <div>
                                <p>{sentenceTranslated}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <p>Click on a word to see translations.</p>
                )}
            </div>
        </div>
    );
};

export default Dictionary;
