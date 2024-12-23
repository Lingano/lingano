import React from "react";
import styles from "./Premium.module.css";
import api from "../utils/api";
const Premium: React.FC = () => {
    // find the name of the current user from the token cookie

    return (
        <>
            <div className={styles.container}>
                <h1 className={styles.heading}>Premium Version</h1>
                <p className={styles.description}>
                    Unlock all features and enjoy an ad-free experience with our
                    premium version.
                </p>

                <div className={styles.pricing}>
                    <h2>Pricing</h2>
                    <div className={styles.priceBox}>
                        <p className={styles.priceAmount}>CHF 9.99</p>
                        <p className={styles.priceDuration}>per month</p>
                    </div>
                    <div className={styles.priceBox}>
                        <p className={styles.priceAmount}>CHF 99.99</p>
                        <p className={styles.priceDuration}>per year</p>
                    </div>
                </div>

                <button
                    className={styles.button}
                    onClick={() => api.addPremiumToCurrentUser()}
                >
                    Buy Premium
                </button>
            </div>
        </>
    );
};

export default Premium;
