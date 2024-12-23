import Reader from "../components/Reader";
import Dictionary from "../components/Dictionary";
import Quiz from "../components/Quiz";
import styles from "./Reading.module.css";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Word } from "../interfaces/Word";
import api from "../utils/api";
import { translate } from "../utils/TranslationAPI";
import { QuizData } from "../interfaces/QuizData";
import { ObjectId } from "mongodb";
import { Reading } from "../interfaces/Readings";

interface DictionaryData {
    selectedWordString: string;
    selectedWordStringTranslated: string;
    selectedSentenceString: string;
    selectedSentenceStringTranslated: string;
}

const ReadingPage = () => {
    const location = useLocation();

    const [formattedText, setFormattedText] = useState<Word[][][] | null>(null);
    const [translationCache, setTranslationCache] = useState<string[][] | null>(
        null
    );
    const [selectedWord, setSelectedWord] = useState<
        [number, number, number] | null
    >(null);
    const [dictionaryData, setDictionaryData] = useState<DictionaryData>({
        selectedWordString: "",
        selectedWordStringTranslated: "",
        selectedSentenceString: "",
        selectedSentenceStringTranslated: "",
    });
    const [title, setTitle] = useState<string | null>(null);
    const [language, setLanguage] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<
        "dictionary" | "quiz" | "fullpageQuiz"
    >("dictionary"); // handling right-side view
    const [readingId, setReadingId] = useState<ObjectId | null>(null);
    const [quiz, setQuiz] = useState<QuizData | null>(null);

    const [colors, setColors] = useState<string[]>(() => {
        const savedColors = localStorage.getItem("myColors");
        return savedColors ? JSON.parse(savedColors) : ["#debb4e", "#e1e1dd"];
    });

    // Function to get query parameters
    const getQueryParams = (search: string) => {
        return new URLSearchParams(search);
    };

    useEffect(() => {
        localStorage.setItem("myColors", JSON.stringify(colors));
    }, ([colors]));

    // activated on first load, get reading data
    useEffect(() => {
        const queryParams = getQueryParams(location.search);
        const id = queryParams.get("id");

        if (id) {
            api.fetchReading(parseInt(id))
                .then((data: Reading) => {
                    if (data) {
                        console.log("reading: ", data);
                        setFormattedText(data.formatted_text);
                        setTitle(data.title);
                        setLanguage(data.language);
                        setReadingId(data._id);
                        setTranslationCache(data.translation_cache);
                    } else {
                        console.error("Error: Data is undefined");
                    }
                })
                .catch((error) => console.error("Error:", error));
        }
    }, [location.search]);

    // get user state
    useEffect(() => {
        const getQuizData = async () => {
            if (readingId) {
                const q: QuizData = await api.getReadingQuizData(readingId);
                // console.log("quiz is: ", q);
                if (
                    q.questions &&
                    q.questions.length !== 0 &&
                    q.questions.length > q.current &&
                    q.current >= 0
                )
                    setQuiz({
                        questions: q.questions,
                        current: q.current,
                    });
            }
        };

        getQuizData();

        // TODO: get current selectedWord from server
    }, [readingId]);

    // activated when selectedWord changes
    useEffect(() => {
        // update dictionary data
        const updateDictionaryData = async (): Promise<void> => {
            if (
                readingId &&
                formattedText &&
                translationCache &&
                selectedWord &&
                language
            ) {
                let newWord: string = "";
                let newWordTranslated: string = "";
                let newSentence: string = "";
                let newSentenceTranslated: string = "";

                newWord =
                    formattedText[selectedWord[0]][selectedWord[1]][
                        selectedWord[2]
                    ].text;

                newSentence = formattedText[selectedWord[0]][selectedWord[1]]
                    .map((word) => word.prefix + word.text + word.postfix)
                    .join(" ");

                newWordTranslated =
                    // get new translation if word changed
                    dictionaryData?.selectedWordString !== newWord
                        ? await translate(language, "en", newWord)
                        : dictionaryData.selectedWordStringTranslated;

                newSentenceTranslated =
                    // get new translation if sentence changed
                    dictionaryData?.selectedSentenceString !== newSentence
                        ? translationCache[selectedWord[0]][selectedWord[1]] ||
                          (await translate(language, "en", newSentence))
                        : dictionaryData.selectedSentenceStringTranslated;

                // if sentence translation was not found in cache
                if (!translationCache[selectedWord[0]][selectedWord[1]]) {
                    // update local cache
                    translationCache[selectedWord[0]][selectedWord[1]] =
                        newSentenceTranslated;
                    // update server cache
                    api.updateReadingTranslationCache(
                        readingId,
                        [selectedWord[0], selectedWord[1]],
                        newSentenceTranslated
                    );
                }

                setDictionaryData({
                    selectedWordString: newWord,
                    selectedWordStringTranslated: newWordTranslated,
                    selectedSentenceString: newSentence,
                    selectedSentenceStringTranslated: newSentenceTranslated,
                });
            }
        };
        updateDictionaryData();

        // save clicked word to server
        if (readingId && selectedWord) {
            api.addClickedWord(readingId, [
                selectedWord[0],
                selectedWord[1],
                selectedWord[2],
            ]);
        }
    }, [selectedWord]);

    return (
        <>
            <Helmet>
                <title>{title ?? "Reading"}</title>
                {/* <link rel="icon" href="/path/to/icon.png" /> */}
            </Helmet>
            {formattedText && title && language && (
                <div
                    className={`${styles.reading} ${
                        activeView === "fullpageQuiz" ? styles.fullpageQuiz : ""
                    }`}
                >
                    {activeView !== "fullpageQuiz" && (
                        <Reader
                            title={title}
                            formattedText={formattedText}
                            selectedWord={selectedWord}
                            updateSelectedWord={(
                                i: number,
                                j: number,
                                k: number
                            ) => setSelectedWord([i, j, k])}
                            colors={colors}
                            setColors={setColors}
                        ></Reader>
                    )}
                    {/* if view = dictionary display quiz component */}
                    {activeView !== "fullpageQuiz" &&
                        activeView === "dictionary" &&
                        language && (
                            <Dictionary
                                onViewChange={setActiveView}
                                word={dictionaryData.selectedWordString}
                                sentence={dictionaryData.selectedSentenceString}
                                wordTranslated={
                                    dictionaryData.selectedWordStringTranslated
                                }
                                sentenceTranslated={
                                    dictionaryData.selectedSentenceStringTranslated
                                }
                                language={language}
                                onSaveWord={() => {
                                    console.log(
                                        `Saving to server:\n    word: ${dictionaryData.selectedWordString}\n    meaning: ${dictionaryData.selectedWordStringTranslated}\n    language: ${language}`
                                    );
                                    if (readingId && selectedWord)
                                        api.addSavedWord(
                                            dictionaryData.selectedWordString,
                                            dictionaryData.selectedWordStringTranslated,
                                            language,
                                            selectedWord,
                                            readingId
                                        );
                                }}
                                colors={colors}
                            ></Dictionary>
                        )}
                    {/* if view = quiz display quiz component */}
                    {(activeView === "fullpageQuiz" || activeView === "quiz") &&
                        language &&
                        readingId && (
                            <Quiz
                                onViewChange={setActiveView}
                                activeView={activeView}
                                language={language}
                                readingId={readingId}
                                formattedText={formattedText}
                                quiz={quiz}
                                setQuiz={setQuiz}
                            />
                        )}
                </div>
            )}
        </>
    );
};

export default ReadingPage;
