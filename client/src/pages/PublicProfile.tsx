import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { User } from "../interfaces/Users";
import styles from "./PublicProfile.module.css"; // Ensure this path is correct
import { Helmet } from "react-helmet";
import SharedCardContainer from "../components/SharedCardContainer";
import { SharedReadingExcerpt } from "../interfaces/SharedReading";
import { useNavigate } from "react-router-dom";
import languageAbbreviations from "../utils/conversions";

// This will need to check if the user checks his own profile or not to bypass the privacy settings.

const PublicProfile: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [userPublicReadings, setUserPublicReadings] = useState<
        SharedReadingExcerpt[]
    >([]);

    // get the user name from the url which follows the /profile/name pattern
    const url = window.location.href;
    const username = url.split("/").pop() || "";

    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (username === "") {
                    return;
                }
                const response = await api.fetchUserDataByName(username);
                if (response) {
                    setUser(response);
                }
                const publicReadings = await api.fetchUserPublicReadingsByName(
                    username
                );
                const filteredReadings = publicReadings.filter(
                    (reading) => reading.owner_name === username
                );
                if (filteredReadings.length > 0) {
                    setUserPublicReadings(filteredReadings);
                } else {
                    setUserPublicReadings([]);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUser();
    }, [username]);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Helmet>
                <title>{user.name}'s Profile</title>
            </Helmet>
            <div>
                <div className={styles["profile-container"]}>
                    <div className={styles["profile-header"]}>
                        <img
                            className={styles["profile-picture"]}
                            src={user.profile.profile_picture}
                            alt={`${user.name}'s profile`}
                        />
                    </div>
                    <h1>{user.name}</h1>
                    {user.preferences.privacy.profileVisibility ===
                        "public" && (
                        <>
                            <div className={styles["profile-details"]}>
                                <div className={styles["profile-detail-item"]}>
                                    <p>Username:</p>
                                    <p>{user.name}</p>
                                </div>
                                <div className={styles["profile-detail-item"]}>
                                    <p>Description:</p>
                                    <p
                                        className={
                                            styles["profile-description"]
                                        }
                                    >
                                        {user.profile.description}
                                    </p>
                                </div>
                                <div className={styles["profile-detail-item"]}>
                                    <p>Email:</p>
                                    <p>{user.email}</p>
                                </div>
                                {user.premium && (
                                    <div
                                        className={
                                            styles["profile-detail-item"]
                                        }
                                    >
                                        <p>Premium User</p>
                                    </div>
                                )}
                                {user.god_mode && (
                                    <div
                                        className={
                                            styles["profile-detail-item"]
                                        }
                                    >
                                        <p>God Mode Enabled</p>
                                    </div>
                                )}
                                {/* <div className={styles["profile-detail-item"]}>
                                    <p>Location:</p>
                                    <p>{user.profile.location}</p>
                                </div>
                                <div className={styles["profile-detail-item"]}>
                                    <p>Total ⭐:</p>
                                    <p>2137</p>
                                </div> */}
                            </div>

                            <h2>Public Readings</h2>
                            <p>
                                Click on a reading to import it to your account
                            </p>

                            <div className={styles.posts}>
                                {userPublicReadings.map((reading, index) => (
                                    <SharedCardContainer
                                        key={index}
                                        username={user.name}
                                        title={reading.title || "Untitled"}
                                        profilePicture={
                                            user.profile.profile_picture
                                        }
                                        language={
                                            languageAbbreviations[
                                                reading.language
                                            ]
                                        }
                                        preview={reading.excerpt || ""}
                                        action={() => {
                                            console.log(
                                                "Reading ID: ",
                                                reading.internal_user_id
                                            );
                                            if (
                                                reading.owner_name !== user.name
                                            ) {
                                                api.importPublicReadingToUser(
                                                    reading.owner,
                                                    reading.internal_user_id
                                                )
                                                    .then((body) => {
                                                        console.log(body);
                                                        navigate(
                                                            "/reading?id=" +
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
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                    {user.preferences.privacy.profileVisibility ===
                        "private" && (
                        <>
                            <h1 color="red">This profile is private.</h1>
                            <h2>Public Readings</h2>
                            <p>
                                Click on a reading to import it to your account
                            </p>

                            <div className={styles.posts}>
                                {userPublicReadings.map((reading, index) => (
                                    <SharedCardContainer
                                        key={index}
                                        username={user.name}
                                        title={reading.title || "Untitled"}
                                        profilePicture={
                                            user.profile.profile_picture
                                        }
                                        language={
                                            languageAbbreviations[
                                                reading.language
                                            ]
                                        }
                                        preview={reading.excerpt || ""}
                                        action={() => {
                                            console.log(
                                                "Reading ID: ",
                                                reading.internal_user_id
                                            );
                                            if (
                                                reading.owner_name !== user.name
                                            ) {
                                                api.importPublicReadingToUser(
                                                    reading.owner,
                                                    reading.internal_user_id
                                                )
                                                    .then((body) => {
                                                        console.log(body);
                                                        navigate(
                                                            "/reading?id=" +
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
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default PublicProfile;
