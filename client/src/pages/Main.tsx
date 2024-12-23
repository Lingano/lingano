import styles from "./Main.module.css";
import ReadingCardContainer from "../components/ReadingCardContainer";
import SharedCardContainer from "../components/SharedCardContainer";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { SharedReadingExcerpt } from "../interfaces/SharedReading";
import { getLanguageFullName } from "../utils/getLanguageFullName";
import Spinner1 from "../components/Spinner1";
import { ReadingExcerpt } from "../interfaces/Readings";
/**
 * API annotation:
 *
 * /api/readings/get_all_current_user_readings ---> fetches all readings for the current user
 *                                                  (will be in continue readings)
 * /api/readings/get_all_public ---> fetches all public readings (will be in shared readings)
 */

const MainPage = () => {
    const navigate = useNavigate();
    // readingData: arrays containing my readings
    const [readingData, setReadingData] = useState<ReadingExcerpt[] | null>(
        null
    );
    // sharedData: array containing shared readings (those with public_access == true)
    const [sharedData, setSharedData] = useState<SharedReadingExcerpt[] | null>(
        null
    );
    // state for error message/not logged in
    const [error, setError] = useState<string | null>(null);
    // category cards
    const [categoryFilteredData, setCategoryFilteredData] = useState<
        SharedReadingExcerpt[] | null
    >(null);
    // user category selection
    const [selectedCategory, setSelectedCategory] = useState("");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchReadings = async () => {
            try {
                // fetch the readings for "Continue Reading"
                const userReadingsResponse =
                    await api.fetchCurrentUserReadings();

                // console.log("userReadingsResponse: ", userReadingsResponse);
                const userReadings: ReadingExcerpt[] =
                    await userReadingsResponse;

                // fetch the readings for "Other Users Share"
                const publicReadingsResponse = await api.fetchPublicReadings();

                const publicReadings: SharedReadingExcerpt[] =
                    await publicReadingsResponse;
                // console.log("publicReadings: ", publicReadingsResponse);
                // update state
                setReadingData(userReadings);
                setSharedData(publicReadings);

                setError(null); // Clear any previous errors
            } catch (error) {
                console.error("Error fetching readings:", error);
                setError(
                    "Unable to load readings. Please log in to see your readings and what others share."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchReadings();
    }, []);

    // fiter based on category
    useEffect(() => {
        if (selectedCategory && sharedData) {
            const filtered = sharedData.filter(
                (item) => item.category === selectedCategory
            );
            setCategoryFilteredData(filtered);
        } else {
            setCategoryFilteredData(sharedData);
        }
    }, [selectedCategory, sharedData]);

    // handle category selection
    const handleCategoryChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setSelectedCategory(event.target.value);
    };

    return (
        <>
            <Helmet>
                <title>Main Page</title>
            </Helmet>
            <div className={styles.Reading}>
                <div className={styles.ContinueReading}>
                    <h2> Continue Reading </h2>
                    <div className={styles.ReadingCardsContainer}>
                        {/* error if not logged in */}
                        {error && (
                            <div className={styles.ErrorContainer}>
                                <p>{error}</p>
                            </div>
                        )}
                        {/* message if logged in, but user has no readings yet */}
                        {!error && readingData && readingData.length == 0 && (
                            <p>
                                You don't have readings yet. Go to 'New' and
                                import a reading.
                            </p>
                        )}
                        {loading && <Spinner1 />}
                        {/* mapping functions to show the current readings */}
                        {readingData &&
                            readingData.map(
                                (reading: ReadingExcerpt, index: number) => (
                                    <ReadingCardContainer
                                        key={index}
                                        action={() => {
                                            navigate(
                                                "/reading?id=" +
                                                    reading.reading_internal_id
                                            );
                                        }}
                                        onDelete={async () => {
                                            console.log(
                                                "deleting reading with id: ",
                                                reading.reading_internal_id
                                            );
                                            try {
                                                const response =
                                                    await api.deleteReading(
                                                        reading.reading_internal_id
                                                    );

                                                if (!response || !response.ok) {
                                                    throw new Error(
                                                        `Failed to delete reading: ${response?.status}`
                                                    );
                                                }

                                                setReadingData(
                                                    readingData.filter(
                                                        (r: ReadingExcerpt) =>
                                                            r.reading_internal_id !==
                                                            reading.reading_internal_id
                                                    )
                                                );
                                            } catch (error) {
                                                console.error(
                                                    "Error deleting reading:",
                                                    error
                                                );
                                                alert(
                                                    "Failed to delete reading. Please try again."
                                                );
                                            }
                                        }}
                                        title={reading.title || "Untitled"}
                                        preview={
                                            reading.excerpt.substring(0, 100) ||
                                            ""
                                        } // preview: first 100 characters
                                        language={
                                            getLanguageFullName(
                                                reading.language
                                            ) || "Czech"
                                        } // placeholder for language
                                    />
                                )
                            )}
                    </div>
                </div>
                <div className={styles.SharedReading}>
                    <h2> Other users share </h2>
                    <div className={styles.SharedCardsContainer}>
                        {/* error if not logged in */}
                        {error && (
                            <div className={styles.ErrorContainer}>
                                <p>{error}</p>
                            </div>
                        )}
                        {loading && <Spinner1 />}
                        {/* mapping functions to show the shared readings */}
                        {sharedData &&
                            sharedData.map(
                                (
                                    reading: SharedReadingExcerpt,
                                    index: number
                                ) => (
                                    <SharedCardContainer
                                        key={index}
                                        username={
                                            reading.owner_name || "Anonymous"
                                        }
                                        title={reading.title || "Untitled"}
                                        profilePicture={
                                            reading.profile_picture ||
                                            "default_icon0.jpeg"
                                        }
                                        preview={
                                            reading.excerpt?.substring(
                                                0,
                                                100
                                            ) || ""
                                        }
                                        action={() => {
                                            console.log(
                                                "owner: ",
                                                reading.owner
                                            );
                                            api.importPublicReadingToUser(
                                                reading.owner,
                                                reading.internal_user_id
                                            )
                                                .then((body) => {
                                                    console.log(body);
                                                    navigate(
                                                        "/reading?id=" +
                                                            // it needs to find the reading id inside the users array of the body
                                                            body.reading_internal_id
                                                    );
                                                })
                                                .catch((error) => {
                                                    console.error(
                                                        "Error importing public reading:",
                                                        error
                                                    );
                                                    alert(
                                                        "Failed to import public reading. Please try again. error: " +
                                                            error
                                                    );
                                                });
                                        }}
                                        language={
                                            getLanguageFullName(
                                                reading.language
                                            ) || "Czech"
                                        }
                                    />
                                )
                            )}
                    </div>
                </div>
                <div className={styles.SharedReading}>
                    <div className={styles.titleSelectionWrapper}>
                        <h2> Category: </h2>
                        <div className={styles.selectWrapper}>
                            <select
                                id="category"
                                className={styles.select}
                                required
                                onChange={handleCategoryChange}
                                value={selectedCategory}
                            >
                                <option value="" disabled>
                                    Select a category
                                </option>
                                <option value="fiction">Fiction</option>
                                <option value="article">Article</option>
                                <option value="essay">Essay</option>
                                <option value="scientific-paper">
                                    Scientific Paper
                                </option>
                                <option value="non-fiction">Non-Fiction</option>
                                <option value="poetry">Poetry</option>
                                <option value="drama">Drama</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.SharedCardsContainer}>
                        {/* filtering data based on the selected category and displaying it using shared card container */}
                        {loading && <Spinner1 />}
                        {categoryFilteredData &&
                            categoryFilteredData.map((reading, index) => (
                                <SharedCardContainer
                                    key={index}
                                    username={reading.owner_name || "Anonymous"}
                                    title={reading.title || "Untitled"}
                                    profilePicture={
                                        reading.profile_picture || ""
                                    }
                                    preview={
                                        reading.excerpt?.substring(0, 100) || ""
                                    }
                                    action={() => {
                                        console.log("owner: ", reading.owner);
                                        api.importPublicReadingToUser(
                                            reading.owner,
                                            reading.internal_user_id
                                        )
                                            .then((body) => {
                                                console.log(body);
                                                navigate(
                                                    "/reading?id=" +
                                                        // it needs to find the reading id inside the users array of the body
                                                        body.reading_internal_id
                                                );
                                            })
                                            .catch((error) => {
                                                console.error(
                                                    "Error importing public reading:",
                                                    error
                                                );
                                                alert(
                                                    "Failed to import public reading. Please try again. error: " +
                                                        error
                                                );
                                            });
                                    }}
                                    language={
                                        getLanguageFullName(reading.language) ||
                                        "Czech"
                                    }
                                />
                            ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default MainPage;
