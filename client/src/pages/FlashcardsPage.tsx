import React, { useEffect, useState } from "react";
import styles from "./FlashcardsPage.module.css";
import { Helmet } from "react-helmet";
import { removeSavedWord } from "../utils/api";
import { getSavedWords } from "../utils/api";
import { updateSavedWord } from "../utils/api";
import { updateStar } from "../utils/api";
import leftArrow from "../assets/left-arrow.svg";
import rightArrow from "../assets/right-arrow.svg";
import { SavedWord } from "../interfaces/SavedWord";

type FlashcardWithDelete = SavedWord & { isDeleting?: boolean };

const FlashcardsPage: React.FC = () => {
    const [flashcards, setFlashcards] = useState<FlashcardWithDelete[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [sessionStarted, setSessionStarted] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionDirection, setTransitionDirection] = useState("");
    const [animationPhase, setAnimationPhase] = useState("");
    const [favourites, setFavourites] = useState<boolean[]>([]);
    const [hasUserTriggeredFetch, setHasUserTriggeredFetch] = useState(false);
    const [hasUserTriggeredNewFetch, setHasUserTriggeredNewFetch] = useState(false);
    const [hasUserTriggeredFavourite, setHasUserTriggeredFavourite] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");
    const [notificationVisible, setNotificationVisible] = useState(false);
    const [notificationPosition, setNotificationPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    const showNotification = (message: string, rect: DOMRect) => {
        setNotificationMessage(message);
        setNotificationPosition({ top: rect.top - 50, left: rect.right - 220 }); 
        setNotificationVisible(true);
        setTimeout(() => {
          setNotificationVisible(false);
        }, 2000); 
      };

    useEffect(() => {
        const handleKeydown = (event: KeyboardEvent) => {
            if (event.key === "ArrowRight") {
                handleNextFlashcard();
            } else if (event.key === "ArrowLeft") {
                handlePreviousFlashcard();
            } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                event.preventDefault();
                handleFlipFlashcard();
            }
        };
        window.addEventListener("keydown", handleKeydown);
        return () => window.removeEventListener("keydown", handleKeydown);
    }, [currentIndex, flipped, isTransitioning]);

    const handleNextFlashcard = () => {
        if (isTransitioning) return;
        if (currentIndex < flashcards.length - 1) {
            setIsTransitioning(true);
            setTransitionDirection("next");
            setAnimationPhase("out");
        } else {
            setSessionComplete(true);
            
        }
    };

    const handlePreviousFlashcard = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setTransitionDirection("prev");
        setAnimationPhase("out");
    };

    const handleFlipFlashcard = () => {
        if (isTransitioning) return;
        setFlipped(!flipped);
    };

    const handleAnimationEnd = () => {
        if (!isTransitioning) return;

        if (animationPhase === "out") {
            if (transitionDirection === "next") {
                setCurrentIndex((prevIndex) => prevIndex + 1);
            } else if (transitionDirection === "prev") {
                setCurrentIndex(
                    (prevIndex) =>
                        (prevIndex - 1 + flashcards.length) % flashcards.length
                );
            }
            setAnimationPhase("in");
        } else if (animationPhase === "in") {
            setIsTransitioning(false);
            setTransitionDirection("");
            setAnimationPhase("");
        }
    };

    const handleLearned = (event: React.MouseEvent<HTMLButtonElement>) => {
        console.log("User marked the word as learned");
        const rect = event.currentTarget.getBoundingClientRect();
        const card = flashcards[currentIndex];
        const newKnowledgeLevel = card.knowledge_level + 1;
        const newCard = updateSpacedRepetition(card, newKnowledgeLevel);
        handleUpdate(newCard);
        showNotification("Knowledge level increased by 1!", rect);
    };

    const handleNotLearned = (event: React.MouseEvent<HTMLButtonElement>) => {
        console.log("User marked the word as not learned");
        const rect = event.currentTarget.getBoundingClientRect();
        const card = flashcards[currentIndex];
        const newKnowledgeLevel = card.knowledge_level - 1;
        const newCard = updateSpacedRepetition(card, newKnowledgeLevel);
        handleUpdate(newCard);
        showNotification("Knowledge level decreased by 1!", rect);
    };

    const handleDelete = async (word: string, language: string, event: React.MouseEvent<HTMLButtonElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
    
        // Mark the current card for deletion
        const updatedFlashcards = [...flashcards];
        updatedFlashcards[currentIndex] = {
            ...updatedFlashcards[currentIndex],
            isDeleting: true,
        };
        setFlashcards(updatedFlashcards);
    
        // Show the notification
        showNotification("Word deleted!", rect);
    
        setTimeout(() => {
            // Remove the current flashcard
            const remainingFlashcards = updatedFlashcards.filter(
                (flashcard) => flashcard.text !== word
            );
    
            if (remainingFlashcards.length === 0) {
                // If no flashcards remain, mark the session as complete
                setSessionComplete(true);
            } else {
                // If there are still flashcards, adjust the current index
                const newIndex = currentIndex >= remainingFlashcards.length
                    ? remainingFlashcards.length - 1 // Go to the previous card if we deleted the last card
                    : currentIndex; // Stay on the same index if there are more cards
                setCurrentIndex(newIndex);
            }
    
            setFlashcards(remainingFlashcards);
        }, 500); // Match the CSS animation duration
    
        try {
            const response = await removeSavedWord(word, language);
            if (response.status !== 200 && response.status !== 204) {
                console.error("Failed to delete the word:", response.statusText);
            }
        } catch (error) {
            console.error("Error deleting word:", error);
        }
    };
    

    const handleUpdate = async ( card: SavedWord ) => {
        try {
            const response = await updateSavedWord(
                card.text,
                card.language,
                card.knowledge_level,
                card.interval,
                card.easinessFactor,
                card.repetitions,
                card.dueDate,
                card.lastReviewed
            );
            if (response.status === 200) {
                setFlashcards((prevFlashcards) => {
                    const updatedFlashcards = [...prevFlashcards];
                    updatedFlashcards[currentIndex] = card;
                    return updatedFlashcards;
                });
            } else {
                console.error(
                    "Failed to update the word:",
                    response.statusText
                );
            }
        } catch (error) {
            console.error("Error updating word:", error);
        }
    };

    const togglePlayPause = () => {
        setIsPlaying((prevState) => !prevState);
    };

    useEffect(() => {
        if (isPlaying && !isTransitioning) {
            const interval = setInterval(() => {
                if (!flipped) {
                    setFlipped(true);
                } else if (currentIndex < flashcards.length - 1) {
                    setFlipped(false);
                    handleNextFlashcard();
                } else {
                    setIsPlaying(false);
                    setSessionComplete(true);
                    setFlipped(false);
                }
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [isPlaying, flipped, currentIndex, flashcards.length, isTransitioning]);

    const restartPractice = () => {
        setSessionComplete(false);
        setCurrentIndex(0);
        setFlipped(false);
        setIsPlaying(false);
        setIsTransitioning(false);
        setTransitionDirection("");
        setAnimationPhase("");
    };

    const pronounce = (text: string, language: string) => {
        const synth = window.speechSynthesis;
        const utterThis = new SpeechSynthesisUtterance(text);
        utterThis.lang = language;
        synth.speak(utterThis);
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const card = flashcards[currentIndex];
        const newFavouriteState = !card.favourite;

        setFavourites((prevFavourites) => {
            const updatedFavourites = [...prevFavourites];
            updatedFavourites[currentIndex] = newFavouriteState;
            return updatedFavourites;
        });
    
        setFlashcards((prevFlashcards) => {
            const updatedFlashcards = [...prevFlashcards];
            updatedFlashcards[currentIndex] = {
                ...card,
                favourite: newFavouriteState,
            };
            return updatedFlashcards;
        });
        showNotification(newFavouriteState ? "Added to favourites!" : "Removed from favourites!", rect);
    
        handleStar(card.text, card.language, newFavouriteState)
            .then(() => {
                console.log("Star updated successfully");
            })
            .catch((error) => {
                console.error("Error updating star:", error);

                setFavourites((prevFavourites) => {
                    const updatedFavourites = [...prevFavourites];
                    updatedFavourites[currentIndex] = !newFavouriteState;
                    return updatedFavourites;
                });
    
                setFlashcards((prevFlashcards) => {
                    const updatedFlashcards = [...prevFlashcards];
                    updatedFlashcards[currentIndex] = {
                        ...card,
                        favourite: !newFavouriteState,
                    };
                    return updatedFlashcards;
                });
            });
    };

    const handleStar = async (
        word: string,
        language: string,
        favourite: boolean
    ) => {
        try {
            const response = await updateStar(word, language, favourite);
            if (response.status === 200) {
                console.log("Star updated successfully");
            } else {
                console.error(
                    "Failed to update the star:",
                    response.statusText
                );
            }
        } catch (error) {
            console.error("Error updating star:", error);
        }
    };

    useEffect(() => {
        if (hasUserTriggeredFetch === true) {
            fetchFlashcards();
            setHasUserTriggeredFetch(false);
        }
    }, [hasUserTriggeredFetch]);

    useEffect(() => {
        if (hasUserTriggeredNewFetch === true) {
            fetchNewFlashcards();
            setHasUserTriggeredNewFetch(false);
        }
    }, [hasUserTriggeredNewFetch]);

    useEffect(() => {
        if (hasUserTriggeredFavourite === true) {
            fetchFavourites();
            setHasUserTriggeredFavourite(false);
        }
    }, [hasUserTriggeredFavourite]);

    
    const fetchFlashcards = () => {
        getSavedWords().then((saved_words) => {
            if (saved_words) {
                const now = new Date();
                const cardsForToday = saved_words.filter((word) => {
                    const date = new Date(word.dueDate);
                    return date.getDate() === now.getDate();
                });
                const shuffledFlashcards = cardsForToday.sort(
                    () => Math.random() - 0.5
                );
                const selectedFlashcards = shuffledFlashcards.slice(0, 30);
                setFlashcards(selectedFlashcards);
                const favourites = selectedFlashcards.map((card) => card.favourite);
                setFavourites(favourites);
                setSessionComplete(false);
                setCurrentIndex(0);
                setFlipped(false);
                setIsPlaying(false);
                setIsTransitioning(false);
                setTransitionDirection("");
                setAnimationPhase("");
                setSessionStarted(false);
            }
        });
    };

    const practiceWords = () => {
        setHasUserTriggeredFetch(true);
    }

    const updateSpacedRepetition = ( card : SavedWord, level: number ) => {
        const now = new Date();
        let { interval, easinessFactor, repetitions, dueDate, lastReviewed, knowledge_level } = card;
        
        // For favourite cards, there is a different logic from the rest:
        // Favourites appear twice as often
        // And reduce penalty for favourite cards
        const favouriteMultiplier = card.favourite ? 0.5 : 1;
        const favouritePenaltyReduction = card.favourite ? 0.5 : 1; 
        
        if (level >= 1) {
            repetitions += 1;
            interval = repetitions === 1 
                ? 1 
                : repetitions === 2 
                    ? 6 
                    : Math.round(interval * easinessFactor * favouriteMultiplier);
        } else {
            repetitions = 0;
            // There must be less penalty for wrong answers on favourites
            interval = Math.round(1 * favouritePenaltyReduction); 
        }

        easinessFactor = Math.max(
            1.3,
            easinessFactor + (0.1 - (5 - level) * (0.04 + (5 - level) * 0.02 * favouritePenaltyReduction))
        );

        dueDate = new Date(now.getDate() + interval);
        lastReviewed = now;
        knowledge_level = level;
    
        return {
            ...card,
            interval,
            easinessFactor,
            repetitions,
            dueDate,
            lastReviewed,
            knowledge_level
        };
    };


    const fetchNewFlashcards = () => {
        getSavedWords().then((saved_words) => {
            if (saved_words) {
                const now = new Date();
                const cardsForToday = saved_words.filter((word) => {
                    const date = new Date(word.dueDate);
                    return date.getDate() === now.getDate();
                });
                const shuffledFlashcards = cardsForToday.sort(
                    () => Math.random() - 0.5
                );
                const selectedFlashcards = shuffledFlashcards.slice(0, 30);
                setFlashcards(selectedFlashcards);
                const favourites = selectedFlashcards.map((card) => card.favourite);
                setFavourites(favourites);
                setSessionComplete(false);
                setCurrentIndex(0);
                setFlipped(false);
                setIsPlaying(false);
                setIsTransitioning(false);
                setTransitionDirection("");
                setAnimationPhase("");
            }
        });
    };

    const practiceWithNewSet = () => {
        setHasUserTriggeredNewFetch(true);
    };

    const fetchFavourites = () => {
        getSavedWords().then((saved_words) => {
            if (saved_words) {
                const now = new Date();
                const cardsForToday = saved_words.filter((word) => {
                    const date = new Date(word.dueDate);
                    return date.getDate() === now.getDate();
                });
                const favouriteWordsForToday = cardsForToday.filter((word) => word.favourite === true);
                const shuffledFlashcards = favouriteWordsForToday.sort(
                    () => Math.random() - 0.5
                );
                const selectedFlashcards = shuffledFlashcards.slice(0, 30);
                setFlashcards(selectedFlashcards);
                const favourites = selectedFlashcards.map((card) => card.favourite);
                setFavourites(favourites);
                setSessionComplete(false);
                setCurrentIndex(0);
                setFlipped(false);
                setIsPlaying(false);
                setIsTransitioning(false);
                setTransitionDirection("");
                setAnimationPhase("");
            }
        });
    };
    
    const practiceWithFavourites = () => {
        setHasUserTriggeredFavourite(true);
    }

    return (
        <>
            <Helmet>
                <title>Word Practice</title>
            </Helmet>
            <div className={styles.flashcardsContainer}>
            {notificationVisible && (
                <div
                    className={styles.notification}
                    style={{
                    position: "absolute",
                    top: notificationPosition.top,
                    left: notificationPosition.left,
                    }}
                >
                    {notificationMessage}
                </div>
                )}
                {sessionComplete ? (
                    <div className={styles.endOptions}>
                        <h2>
                            Congratulations! You've completed the practice
                            session.
                        </h2>
                        <button
                            onClick={restartPractice}
                            className={styles.restartButton}
                        >
                            Restart Practice
                        </button>
                        <button
                            onClick={practiceWithNewSet}
                            className={styles.newSetButton}
                        >
                            New Set Practice
                        </button>
                        <h2>
                            Do you want to practice with your favourite words? &#128071;
                        </h2>
                        <button
                            onClick={practiceWithFavourites}
                            className={styles.favouriteButton}
                        >
                            Click here
                        </button>
                    </div>
                ) : sessionStarted ? (
                    <div className={styles.endOptions}>
                        <h2 className={styles.flashcardsHeader}>
                            Do you wanna try some flashcards today? 
                        </h2>
                        <button
                            onClick={practiceWords}
                            className={styles.practiceWordsButton}
                        >
                            Start practice
                        </button>
                    </div>
                ) : flashcards.length > 0 ? (
                    <>  
                        <h1 className={styles.flashcardsHeader}>
                            Study Your Flashcards
                        </h1>
                        <div className={styles.flashcardWrapper}>
                        <div
                            onClick={handleFlipFlashcard}
                            className={`${styles.flashcard} ${
                                flipped ? styles.flip : ""
                            } ${
                                isTransitioning
                                    ? animationPhase === "out"
                                        ? styles.fadeOut
                                        : styles.fadeIn
                                    : ""
                            }${
                                flashcards[currentIndex]?.isDeleting ? styles.deleting : ""
                            }`}
                            onAnimationEnd={handleAnimationEnd}
                        >
                            {flipped ? (
                                <div className={styles.translation}>
                                    <p>{flashcards[currentIndex].meaning}</p>
                                </div>
                            ) : (
                                <div className={styles.word}>
                                    <p>{flashcards[currentIndex].text}</p>
                                    <button
                                        className={`${styles.starButton} ${
                                            favourites[currentIndex] ? styles.starButtonActive : ""
                                        }`}
                                        onClick={handleClick}
                                    >
                                        ☆
                                    </button>
                                    <div
                                        className={styles.speaker}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            pronounce(
                                                flashcards[currentIndex].text,
                                                flashcards[currentIndex].language
                                            );
                                        }}
                                    >
                                        <a href="#">&#x1F50A;</a>
                                    </div>
                                </div>
                            )}
                        </div>
                            <div className={styles.navigationButtons}>
                                <button
                                    className={styles.arrowButton}
                                    onClick={handlePreviousFlashcard}
                                    disabled={isTransitioning}
                                >
                                    <img src={leftArrow} alt="Previous" />
                                </button>
                                <button
                                    className={styles.arrowButton}
                                    onClick={handleNextFlashcard}
                                    disabled={isTransitioning}
                                >
                                    <img src={rightArrow} alt="Next" />
                                </button>
                            </div>
                        </div>
                        <div className={styles.feedbackButtons}>
                            <button
                                className={`${styles.feedbackButton} ${styles.notLearned}`}
                                onClick={handleNotLearned}
                                disabled={isTransitioning}
                            >
                                ✖ Difficult
                            </button>
                            <div className={styles.progress}>
                                {currentIndex + 1} / {flashcards.length}
                            </div>
                            <button
                                className={`${styles.feedbackButton} ${styles.learned}`}
                                onClick={handleLearned}
                                disabled={isTransitioning}
                            >
                                ✔ Easy
                            </button>
                            <button
                                className={`${styles.deleteButton} ${styles.delete}`}
                                onClick={(event) =>
                                    handleDelete(
                                        flashcards[currentIndex].text,
                                        flashcards[currentIndex].language,
                                        event
                                    )
                                }
                                disabled={isTransitioning}
                            >
                                🗑️ Delete
                            </button>
                            <button
                                className={`${styles.playPauseButton}`}
                                onClick={togglePlayPause}
                            >
                               {isPlaying ? "⏸ Pause" : "▶ Play"}
                            </button>
                        </div>
                    </>
                ) : (
                    <h1 className={styles.noFlashcards}>
                        No flashcards have appeared yet
                    </h1>
                )}
            </div>
        </>
    );
};

export default FlashcardsPage;
