import styles from "./Settings.module.css";
import { Helmet } from "react-helmet";
import { User } from "../interfaces/Users";
import { useState } from "react";
import api from "../utils/api";

interface Props {
    user: User;
    setUser: (newUser: User) => void;
}

const Settings = ({ user, setUser }: Props) => {
    const [profilePicture, setProfilePicture] = useState(
        user.profile.profile_picture
    );
    const [name, setName] = useState(user.name);
    const [description, setDescription] = useState(user.profile.description);
    const [visibility, setVisibility] = useState(
        user.preferences.privacy.profileVisibility
    );

    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
        null
    );

    const handleSave = () => {
        const updatedUser = {
            ...user,
            name,
            profile: {
                ...user.profile,
                profile_picture: profilePicture,
                description,
            },
            preferences: {
                ...user.preferences,
                privacy: {
                    ...user.preferences.privacy,
                    profileVisibility: visibility,
                },
            },
        };
        if (profilePictureFile) {
            api.updateCurrentUserProfilePicture(profilePictureFile);
        }
        setUser(updatedUser);
        api.updateUserpreferences(
            updatedUser.preferences,
            updatedUser.profile,
            updatedUser.name
        );
    };

    return (
        <>
            <Helmet title="Settings" />
            <div>
                <div className={styles.container}>
                    <form
                        className={styles.form}
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSave();
                        }}
                    >
                        <h1 className={styles.h1}>User Settings</h1>

                        <div className={styles.imageGroup}>
                            <label className={styles.label}>
                                Profile Picture:
                            </label>
                            <img
                                className={styles.profilePicture}
                                src={profilePicture}
                                alt="Profile"
                            />
                            <input
                                className={styles.input}
                                type="file"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setProfilePictureFile(
                                            e.target.files[0]
                                        );
                                        setProfilePicture(
                                            URL.createObjectURL(
                                                e.target.files[0]
                                            )
                                        );
                                        setProfilePictureFile(
                                            e.target.files[0]
                                        );
                                    }
                                }}
                                /* type="text"
                                value={profilePicture}
                                onChange={(e) =>
                                   setProfilePicture(e.target.value)
                                } */
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Username:</label>
                            <input
                                className={styles.input}
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        {/* <div className={styles.formGroup}>
                            <label className={styles.label}>Email:</label>
                            <input
                                className={styles.input}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div> */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Description:</label>
                            <input
                                className={styles.textarea}
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                }}
                            />
                        </div>
                        {/* <div className={styles.formGroup}>
                            <label className={styles.label}>Languages:</label>
                            <select
                                className={styles.input}
                                multiple
                                value={UserDataSettings.profile.languages}
                                onChange={handleLanguageChange}
                                size={6}
                            >
                                <option value="English">English</option>
                                <option value="Spanish">Spanish</option>
                                <option value="French">French</option>
                                <option value="German">German</option>
                                <option value="Chinese">Chinese</option>
                                <option value="Japanese">Japanese</option>
                            </select>
                            <div className={styles.selectedLanguages}>
                                Selected:{" "}
                                {(
                                    UserDataSettings.profile.languages || []
                                ).join(", ")}
                            </div>
                        </div> */}
                        {/* <div className={styles.formGroup}>
                            <label className={styles.label}>Location:</label>
                            <input
                                className={styles.input}
                                type="text"
                                value={UserDataSettings.profile.location}
                                onChange={(e) =>
                                    setUserDataSettings({
                                        ...UserDataSettings,
                                        profile: {
                                            ...UserDataSettings.profile,
                                            location: e.target.value,
                                        },
                                    })
                                }
                            />
                        </div> */}
                        {/* <div className={styles.formGroup}>
                            <label className={styles.label}>Theme:</label>
                            <div className={styles.selectWrapper}>
                                <select
                                    className={styles.select}
                                    value={UserDataSettings.preferences?.theme}
                                    onChange={(e) =>
                                        setUserDataSettings({
                                            ...UserDataSettings,
                                            preferences: {
                                                ...UserDataSettings.preferences,
                                                theme: e.target.value,
                                            },
                                        })
                                    }
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                </select>
                            </div>
                        </div> */}
                        {/* <div className={styles.formGroup}>
                            <label className={styles.label}>Language:</label>
                            <input
                                className={styles.input}
                                type="text"
                                value={UserDataSettings.preferences?.language}
                                onChange={(e) =>
                                    setUserDataSettings({
                                        ...UserDataSettings,
                                        preferences: {
                                            ...UserDataSettings.preferences,
                                            language: e.target.value,
                                        },
                                    })
                                }
                            />
                        </div> */}
                        {/* <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Notifications Enabled:
                            </label>
                            <div className={styles.checkboxWrapper}>
                                <input
                                    className={styles.checkbox}
                                    type="checkbox"
                                    checked={
                                        UserDataSettings.preferences
                                            ?.notificationsEnabled
                                    }
                                    onChange={(e) =>
                                        setUserDataSettings({
                                            ...UserDataSettings,
                                            preferences: {
                                                ...UserDataSettings.preferences,
                                                notificationsEnabled:
                                                    e.target.checked,
                                            },
                                        })
                                    }
                                />
                            </div>
                        </div> */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Profile Visibility:
                            </label>
                            <div className={styles.selectWrapper}>
                                <select
                                    className={styles.select}
                                    value={visibility}
                                    onChange={(e) =>
                                        setVisibility(e.target.value)
                                    }
                                >
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.buttonsContainer}>
                            <button className={styles.button} type="submit">
                                Save
                            </button>
                            <button
                                className={styles.button}
                                type="button"
                                onClick={() => {
                                    // reset all inputs to global user values
                                    setName(user.name);
                                    setDescription(user.profile.description);
                                    setProfilePicture(
                                        user.profile.profile_picture
                                    );
                                    setVisibility(
                                        user.preferences.privacy
                                            .profileVisibility
                                    );
                                }}
                            >
                                Reset your changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Settings;
