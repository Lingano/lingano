import { Helmet } from "react-helmet";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Import.module.css";
import api from "../utils/api";
import ImportFromWikipedia from "../components/ImportFromWikipedia";

const Import = () => {
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [language, setLanguage] = useState("");
    const [category, setCategory] = useState("");
    const navigate = useNavigate();

    const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    const handleTitleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    const handleSubmit = () => {
        if (!language) {
            alert("Please select a language.");
            return;
        }

        if (!category) {
            alert("Please select a category.");
            return;
        }

        if (!title) {
            alert("Please choose a title.");
            return;
        }

        if (!text) {
            alert("Please import some text.");
            return;
        }

        api.uploadReading({ title, text, public: isPublic, language, category })
            .then(async (response) => {
                if (!response) {
                    throw new Error("No response from server");
                }
                const data = await response;
                navigate("/reading?id=" + data.internal_user_id);
            })
            .catch((error) => console.error("Error:", error));
    };

    return (
        <>
            <Helmet>
                <title>Import a reading</title>
                {/* <link rel="icon" href="/path/to/icon.png" /> */}
            </Helmet>

            <div className={styles.container}>
                <h2>Import a new reading</h2>
                <div className={styles.titleWrapper}>
                    <label htmlFor="title" className={styles.label}>
                        TITLE
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onInput={handleTitleInput}
                        className={styles.input}
                    />
                </div>
                <div className={styles.textWrapper}>
                    <label htmlFor="text" className={styles.label}>
                        TEXT
                    </label>
                    <textarea
                        id="text"
                        value={text}
                        onInput={handleTextInput}
                    />
                </div>

                <ImportFromWikipedia setText={setText} setTitle={setTitle} setLanguage={setLanguage} setCategory={setCategory} />

                {/* language */}
                <div className={styles.languageWrapper}>
                    <p>LANGUAGE</p>
                    <div className={styles.menuContainerLanguage}>
                        <div className={styles.menuItem}>
                            <button
                                type="button"
                                className={`${styles.menuButton} ${language === "it"
                                        ? styles.active
                                        : styles.inactive
                                    } ${styles.italian}`}
                                onClick={() => setLanguage("it")}
                            ></button>
                        </div>

                        <div className={styles.menuItem}>
                            <button
                                type="button"
                                className={`${styles.menuButton} ${language === "es"
                                        ? styles.active
                                        : styles.inactive
                                    } ${styles.spanish}`}
                                onClick={() => setLanguage("es")}
                            ></button>
                        </div>

                        <div className={styles.menuItem}>
                            <button
                                type="button"
                                className={`${styles.menuButton} ${language === "de"
                                        ? styles.active
                                        : styles.inactive
                                    } ${styles.german}`}
                                onClick={() => setLanguage("de")}
                            ></button>
                        </div>

                        <div className={styles.menuItem}>
                            <button
                                type="button"
                                className={`${styles.menuButton} ${language === "cz"
                                        ? styles.active
                                        : styles.inactive
                                    } ${styles.czech}`}
                                onClick={() => setLanguage("cz")}
                            ></button>
                        </div>

                        <div className={styles.menuItem}>
                            <button
                                type="button"
                                className={`${styles.menuButton} ${language === "fr"
                                        ? styles.active
                                        : styles.inactive
                                    } ${styles.french}`}
                                onClick={() => setLanguage("fr")}
                            ></button>
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className={styles.categoryWrapper}>
                    <p>CATEGORY</p>
                    <div className={styles.menuContainerCategories}>
                        <div className={styles.menuItemC}>
                            <button
                                type="button"
                                className={`${styles.menuButtonC} ${category === "fiction"
                                        ? styles.activeCategory
                                        : ""
                                    }`}
                                onClick={() => setCategory("fiction")}
                            >
                                <span className={styles.icon}>📖</span>
                            </button>
                            <span className={styles.text}>Fiction</span>
                        </div>

                        <div className={styles.menuItemC}>
                            <button
                                type="button"
                                className={`${styles.menuButtonC} ${category === "article"
                                        ? styles.activeCategory
                                        : ""
                                    }`}
                                onClick={() => setCategory("article")}
                            >
                                <span className={styles.icon}>📰</span>
                            </button>
                            <span className={styles.text}>Article</span>
                        </div>

                        <div className={styles.menuItemC}>
                            <button
                                type="button"
                                className={`${styles.menuButtonC} ${category === "essay"
                                        ? styles.activeCategory
                                        : ""
                                    }`}
                                onClick={() => setCategory("essay")}
                            >
                                <span className={styles.icon}>✍️</span>
                            </button>
                            <span className={styles.text}>Essay</span>
                        </div>

                        <div className={styles.menuItemC}>
                            <button
                                type="button"
                                className={`${styles.menuButtonC} ${category === "scientific-paper"
                                        ? styles.activeCategory
                                        : ""
                                    }`}
                                onClick={() => setCategory("scientific-paper")}
                            >
                                <span className={styles.icon}>🔬</span>
                            </button>
                            <span className={styles.text}>Sci. Paper</span>
                        </div>

                        <div className={styles.menuItemC}>
                            <button
                                type="button"
                                className={`${styles.menuButtonC} ${category === "non-fiction"
                                        ? styles.activeCategory
                                        : ""
                                    }`}
                                onClick={() => setCategory("non-fiction")}
                            >
                                <span className={styles.icon}>📚</span>
                            </button>
                            <span className={styles.text}>Non-Fiction</span>
                        </div>

                        <div className={styles.menuItemC}>
                            <button
                                type="button"
                                className={`${styles.menuButtonC} ${category === "poetry"
                                        ? styles.activeCategory
                                        : ""
                                    }`}
                                onClick={() => setCategory("poetry")}
                            >
                                <span className={styles.icon}>🎭</span>
                            </button>
                            <span className={styles.text}>Poetry</span>
                        </div>

                        <div className={styles.menuItemC}>
                            <button
                                type="button"
                                className={`${styles.menuButtonC} ${category === "drama"
                                        ? styles.activeCategory
                                        : ""
                                    }`}
                                onClick={() => setCategory("drama")}
                            >
                                <span className={styles.icon}>🎬</span>
                            </button>
                            <span className={styles.text}>Drama</span>
                        </div>
                    </div>
                </div>

                <div className={styles.visibilityWrapper}>
                    <p>VISIBILITY</p>
                    <div className={styles.publicWrapper}>
                        <button
                            onClick={() => setIsPublic(false)}
                            className={`${styles.private} ${isPublic === false
                                    ? styles.publicActive
                                    : styles.publicInactive
                                }`}
                        >
                            Private
                        </button>
                        <button
                            onClick={() => setIsPublic(true)}
                            className={`${styles.public} ${isPublic === true
                                    ? styles.publicActive
                                    : styles.publicInactive
                                }`}
                        >
                            {" "}
                            Public{" "}
                        </button>
                    </div>
                </div>
                <div className={styles.submitWrapper}>
                    <button
                        onClick={handleSubmit}
                        className={styles.submitButton}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </>
    );
};

export default Import;
