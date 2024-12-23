import React, { useState } from "react";
import axios from "axios";
import styles from "./ImportFromWikipedia.module.css";

const ImportFromWikipedia = ({
    setText,
    setTitle,
    setLanguage,
    setCategory
}: {
    setText: (text: string) => void;
    setTitle: (title: string) => void;
    setLanguage: (language: string) => void;
    setCategory: (category: string) => void;
}) => {
    const [wikiUrl, setWikiUrl] = useState("");
    const [loading, setLoading] = useState(false);

    const handleWikiUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWikiUrl(e.target.value);
    };

    const handleImportFromWikipedia = async () => {
        if (!wikiUrl) {
            alert("Please enter a Wikipedia URL.");
            return;
        }

        setLoading(true);
        try {
            const url = new URL(wikiUrl);
            const language = url.hostname.split(".")[0];
            const pageTitle = url.pathname.split("/").pop() || "";

            const response = await axios.get(
                `https://${language}.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(
                    pageTitle
                )}&format=json&origin=*`
            );
            if (
                response.data &&
                response.data.parse &&
                response.data.parse.text
            ) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(
                    response.data.parse.text["*"],
                    "text/html"
                );
                const paragraphs = doc.querySelectorAll(
                    ".mw-parser-output > p"
                );
                let content = "";
                paragraphs.forEach((p) => {
                    // Remove footnotes
                    p.querySelectorAll("sup").forEach((sup) => sup.remove());
                    content += p.textContent + "\n";
                });
                setText(content.trim());
                setTitle(pageTitle.replace(/_/g, " "));
                setLanguage(language);
                setCategory("article");
            } else {
                alert("Could not fetch the article. Please check the URL.");
            }
        } catch (error) {
            console.error("Error fetching Wikipedia article:", error);
            alert("An error occurred while fetching the article.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.wikiImportWrapper}>
            <label htmlFor="wikiUrl" className={styles.label}>
                IMPORT FROM WIKIPEDIA (URL)
            </label>
            <input
                id="wikiUrl"
                type="text"
                value={wikiUrl}
                onChange={handleWikiUrlChange}
                className={styles.input}
            />
            <button
                onClick={handleImportFromWikipedia}
                className={styles.importButton}
                disabled={loading}
            >
                {loading ? "Importing..." : "Import from Wikipedia"}
            </button>
        </div>
    );
};

export default ImportFromWikipedia;
