import ClickableWord from "./ClickableWord";
import styles from "./Reader.module.css";
import { Word } from "../interfaces/Word";
import { useState } from "react";

interface Props {
    title: string;
    formattedText: Word[][][];
    selectedWord: number[] | null;
    updateSelectedWord: (i: number, j: number, k: number) => void;
    colors: string[];
    setColors: (colors: string[]) => void;
}

const Reader = ({
    title,
    formattedText,
    selectedWord,
    updateSelectedWord,
    colors,
    setColors,
}: Props) => {
    const [displaySettings, setDisplaySettings] = useState<boolean>(false); // showing settings boolean

    const toggleSettings = () => {
        setDisplaySettings((prev) => !prev);
    };

    const handleColorChange = (index: number, newColor: string) => {
        const updatedColors = [...colors];
        updatedColors[index] = newColor;
        setColors(updatedColors);
      };

    const readingContent = formattedText.map((paragraph, i) => {
        const paraGraphMapped = paragraph.map((sentence, j) => {
            return sentence.map((word, k) => {
                return (
                    <ClickableWord
                        key={i + j + k}
                        word={word}
                        selected={
                            selectedWord
                                ? selectedWord[0] === i && selectedWord[1] === j
                                : false
                        }
                        clicked={
                            selectedWord
                                ? selectedWord[0] === i &&
                                  selectedWord[1] === j &&
                                  selectedWord[2] === k
                                : false
                        }
                        isLast={formattedText[i][j].length - 1 === k}
                        onClick={() => updateSelectedWord(i, j, k)}
                        colors={colors}
                    ></ClickableWord>
                );
            });
        });
        return <p key={i}>{paraGraphMapped}</p>;
    });

    return (
        <div className={styles.reader}>
            <div className={styles.settings}>
                <button
                    className={styles.settingsButton}
                    onClick={toggleSettings}
                >
                    &#9881;
                </button>
            </div>
            {displaySettings && (
                <div className={styles.displaySettings}>
                    <label htmlFor="colorPicker" className={styles.label}>
                        Pick a color: word
                    </label>
                    <input
                        className={styles.input}
                        type="color"
                        id="colorPicker"
                        value={colors[0]}
                        onChange={(e) => handleColorChange(0, e.target.value)}
                    />
                    <label htmlFor="colorPicker" className={styles.label}>sentence</label>
                    <input
                        className={styles.input}
                        type="color"
                        id="colorPicker"
                        value={colors[1]}
                        onChange={(e) => handleColorChange(1, e.target.value)}
                    />
                </div>
            )}
            <h1>{title}</h1>
            {readingContent}
        </div>
    );
};

export default Reader;
