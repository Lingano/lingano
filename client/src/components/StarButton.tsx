/* import { useState } from "react";
import styles from "./StarButton.module.css";
import { FlashcardsPage } from "../pages/FlashcardsPage";

const StarButton = () => {
    const [isFavourite, setIsFavourite] = useState(false);
  
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (isFavourite) {
        setIsFavourite(false);
        markAsNotFavourite();
        handleFavourite();
      } else {
        setIsFavourite(true);
        markAsFavourite();
        handleFavorite();
      }
    };

    const markAsFavourite = () => {
      console.log("User clicked on the star");
      const card = FlashcardsPage.flashcards[FlashcardsPage.currentIndex];

    }

  
    return (
      <button
        className={`${styles.starButton} ${isFavourite ? styles.starButtonActive : ""}`}
        onClick={handleClick}
      >
        ☆
      </button>
    );
  };
  
  export default StarButton; */