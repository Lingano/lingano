import React from "react";
import styles from "./ReadingCardContainer.module.css";

type ReadingCardContainerProps = {
    title: string;
    preview: string;
    language: string;
    action: () => void;
    onDelete: () => void;
};

const ReadingCardContainer: React.FC<ReadingCardContainerProps> = ({
    title,
    preview,
    language,
    action,
    onDelete,
}) => {
    return (
        <div onClick={action} className={styles.CardContainer}>
            <button
                className={styles.DeleteButton}
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
            >
                &#10060;
            </button>
            <div className={styles.CardContent}>
                <div className={styles.top}>
                    <div className={styles.CardTitle}>{title}</div>
                    <div className={styles.CardPreview}>{preview} ...</div>
                </div>
                <div className={styles.CardLanguage}>
                    <img src={`../flags/${language}.png`} width="20px"></img>
                    <p>{language}</p>
                </div>
            </div>
        </div>
    );
};

export default ReadingCardContainer;
