////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                            //
//                                                                                                                                            //
//                                                                                                                                            //
//                    DO NOT MODIFY THIS FILE IF SOMETHING IS NOT WORKING CONTACT ME OR CHECK POSTMAN OR PORT 9000                            //
//                                                                                                                                            //
//                                                                                                                                            //
//                                                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import { ObjectId } from "mongodb";
// import { Word } from "../interfaces/Word";

// const API_BASE_URL = "http://localhost:9000";
// const API_BASE_URL = "https://lingano-84ee656e6285.herokuapp.com";
// const API_BASE_URL = "https://lingano.live";
const API_BASE_URL = "https://lingano.live";
// if (import.meta.env.VITE_DEV === "true") {
//     API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// }
const READING_ROUTER = "reading";
const AUTH_ROUTER = "auth";
const USER_ROUTER = "users";

interface ErrorResponseBody {
    message: string;
}

// Error handler for API calls.
const handleError = (error: unknown) => {
    console.error("API call failed: ", error);
    throw error;
};

// Bad response handler for API calls.
const handleBadResponse = async (response: Response) => {
    if (!response.ok) {
        const errorBody: ErrorResponseBody = await response.json();
        console.error("API call failed: ", errorBody.message);
        return errorBody; // Throw the error so it can be caught in the catch block
    }
};

// INTERFACES //////////////////////////////////////////////////////////////
// import { ReadingObject } from "../interfaces/ReadingObject";
import { ReadingUploadData } from "../interfaces/ReadingUploadData";
import { SavedWord } from "../interfaces/SavedWord";
import { UserObject } from "../interfaces/UserObject";
import { LoginData } from "../interfaces/LoginData";
import { RegisterData } from "../interfaces/RegisterData";
import { User } from "../interfaces/Users";
import { Reading, ReadingExcerpt } from "../interfaces/Readings";
import { SharedReadingExcerpt } from "../interfaces/SharedReading";

interface AuthResponse {
    user_data: User;
}

// READING ROUTES //////////////////////////////////////////////////////////

/**
 * Uploads reading data to the server.
 *
 * @param {ReadingUploadData} data - The reading data to be uploaded.
 * format: {
 *    title: string,
 *    text: string,
 *    public: boolean,
 *    language: string,
 *    category: string
 * }
 * @returns {Promise<Reading>} A promise that resolves to the server's response.
 * @throws Will throw an error if the network response is not ok or if the fetch request fails.
 */
export const uploadReading = async (
    data: ReadingUploadData
): Promise<Reading> => {
    try {
        const response = await fetch(`${API_BASE_URL}/${READING_ROUTER}`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        handleBadResponse(response);
        return response.json();
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Fetches a reading from the server based on the provided ID.
 *
 * @param {number} id - The ID (internal not ObjectId) of the reading to fetch.
 * @returns {Promise<Reading>} A promise that resolves to the fetched reading data.
 * @throws Will throw an error if the fetch operation fails.
 */
export const fetchReading = async (id: number): Promise<Reading> => {
    try {
        const response = await fetch(`${API_BASE_URL}/${READING_ROUTER}/get`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
            credentials: "include",
        });
        handleBadResponse(response);
        const data = await response.json();
        return data;
    } catch (error) {
        return handleError(error);
    }
};

import { QuizData } from "../interfaces/QuizData";
import { QuestionData } from "../interfaces/QuestionData";

export const getReadingQuizData = async (
    reading: ObjectId
): Promise<QuizData> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/${USER_ROUTER}/get_quiz_data_from_reading`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ reading }),
                credentials: "include",
            }
        );
        handleBadResponse(response);
        return response.json();
    } catch (error) {
        return handleError(error);
    }
};

export const putQuizData = async (
    reading: ObjectId,
    quizData: QuizData
): Promise<Response> => {
    try {
        console.log("Sending quiz data to server:", reading, quizData);
        const response = await fetch(
            `${API_BASE_URL}/${USER_ROUTER}/add_quiz_data_to_reading`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ reading, quizData }),
                credentials: "include",
            }
        );
        console.log("Response from putQuizData:", response);
        handleBadResponse(response);
        return response;
    } catch (error) {
        return handleError(error);
    }
};

export const updateQuizQuestion = async (
    reading: ObjectId,
    questionIndex: number,
    question: QuestionData
): Promise<Response> => {
    try {
        console.log("Sending updated question to server:", reading, question);
        const response = await fetch(
            `${API_BASE_URL}/${USER_ROUTER}/update_one_quiz_question`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ reading, questionIndex, question }),
                credentials: "include",
            }
        );
        console.log("Response from updateQuizQuestion:", response);
        handleBadResponse(response);
        return response.json();
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Fetches the current user's readings from the server. Works based on the token stored in the browser.
 *
 * @returns {Promise<ReadingExcerpt[]>} A promise that resolves to the JSON response containing the user's readings.
 *
 * @throws Will throw an error if the request fails or if the response is not ok.
 */
export const fetchCurrentUserReadings = async (): Promise<ReadingExcerpt[]> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/${READING_ROUTER}/get_all_current_user_readings`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            }
        );
        handleBadResponse(response);
        const result = await response;
        return result.json();
    } catch (error) {
        return handleError(error);
    }
};

export const fetchUserPublicReadingsByName = async (
    name: string
): Promise<SharedReadingExcerpt[]> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/${READING_ROUTER}/get_public_readings_of_a_user`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name }),
                credentials: "include",
            }
        );
        handleBadResponse(response);
        return response.json();
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Fetches all public readings from the server. Doesn't require authentication. Works for everyone.
 *
 * @returns {Promise<SharedReading[]>} A promise that resolves to the JSON response containing the public readings.
 * @throws Will throw an error if the fetch request fails or if the response is not ok.
 */
export const fetchPublicReadings = async (): Promise<
    SharedReadingExcerpt[]
> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/${READING_ROUTER}/get_all_public`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            }
        );
        handleBadResponse(response);
        return response.json();
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Imports a public reading to the user's personal readings.
 *
 * @param {ObjectId} owner - The ID of the original owner of the reading.
 * @param {number} id - The internal ID of the reading to import. (owner internal id)
 * @returns {Promise<UserObject>} The response from the server.
 * @throws Will throw an error if the fetch request fails.
 */
export const importPublicReadingToUser = async (
    owner: ObjectId,
    id: number
): Promise<UserObject> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/${READING_ROUTER}/import_public_reading`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ owner, id }),
                credentials: "include",
            }
        );
        handleBadResponse(response);
        return response.json();
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Deletes a reading by its ID. The reading must belong to the current user.
 *
 * @param {number} id - The ID of the reading to delete.
 * @returns {Promise<Response>} The response from the server.
 * @throws Will throw an error if the fetch request fails.
 */
export const deleteReading = async (id: number): Promise<Response> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/${READING_ROUTER}/delete`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
                credentials: "include",
            }
        );
        handleBadResponse(response);
        return response;
    } catch (error) {
        return handleError(error);
    }
};

// AUTH ROUTES
interface ErrorResponseBody {
    message: string;
}
/**
 * Logs in a user by sending a POST request to the authentication endpoint.
 * Data format: { email: string, password: string }
 * @param {LoginData} data - The login data to be sent in the request body.
 * @returns {Promise<AuthResponse>} The response from the server.
 * @throws Will throw an error if the request fails.
 */
export const loginUser = async (
    data: LoginData
): Promise<AuthResponse | ErrorResponseBody> => {
    try {
        const response = await fetch(`${API_BASE_URL}/${AUTH_ROUTER}/login`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        if (!response.ok) {
            const Errorbody = await handleBadResponse(response);
            if (Errorbody) {
                throw new Error(Errorbody.message);
            } else {
                throw new Error("Unknown error occurred");
            }
        } else {
            return response.json();
        }
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Registers a new user by sending a POST request to the authentication router.
 *
 * @param {RegisterData} - The user data to be registered. Format: { name: string, email: string, password: string, profilePicture: string }
 * @returns {Promise<AuthResponse>} The response data from the server if the request is successful.
 * @throws {Error} If the network response is not ok or if there is an error during the fetch operation.
 */
export const registerUser = async (
    data: RegisterData
): Promise<AuthResponse> => {
    try {
        const formData = new FormData();

        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append("password", data.password);
        const profilePicture = data.profilePicture;

        if (profilePicture instanceof File) {
            formData.append("profilePicture", profilePicture);
            console.log("Profile Picture File Details:", {
                name: profilePicture.name,
                type: profilePicture.type,
                size: profilePicture.size,
            });
        } else if (typeof profilePicture === "string") {
            formData.append("profilePicture", profilePicture);
        } else {
            formData.append(
                "profilePicture",
                "https://lingano.s3.eu-central-1.amazonaws.com/uploads/profile_pictures/default_icon0.jpeg"
            );
        }

        console.log("FormData Entries:");
        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
            // If it's a file, log additional details
            if (value instanceof File) {
                console.log(`File Details for ${key}:`, {
                    name: value.name,
                    type: value.type,
                    size: value.size,
                });
            }
        }

        const response = await fetch(
            `${API_BASE_URL}/${AUTH_ROUTER}/register`,
            {
                method: "POST",
                body: formData,
                credentials: "include",
            }
        );
        if (!response.ok) {
            const Errorbody = await handleBadResponse(response);
            if (Errorbody) {
                throw new Error(Errorbody.message);
            } else {
                throw new Error("Unknown error occurred");
            }
        } else {
            return response.json();
        }
    } catch (error) {
        return handleError(error);
    }
};

// USER ROUTES
/**
 * Fetches user data by user ID.
 *
 * @param {ObjectId} userId - The ID of the user to fetch data for.
 * @returns {Promise<User>} The response from the fetch call.
 * @throws Will throw an error if the fetch call fails.
 */
export const fetchUserDataById = async (userId: ObjectId): Promise<User> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/${USER_ROUTER}/${userId}`
        );
        handleBadResponse(response);
        return response.json();
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Fetches the current user data from the server. Works based on the token stored in the browser.
 *
 * @returns {Promise<User>} A promise that resolves to the user data in JSON format.
 * @throws Will throw an error if the request fails or the response is not ok.
 */
export const fetchCurrentUserData = async (): Promise<User> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/${USER_ROUTER}/get_user_data`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            }
        );
        handleBadResponse(response);
        return response.json();
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Fetches user data by username.
 *
 * @param {string} username - The username of the user whose data is to be fetched.
 * @returns {Promise<User>} A promise that resolves to the response object containing the user data.
 * @throws Will throw an error if the fetch operation fails.
 */
export const fetchUserDataByName = async (username: string): Promise<User> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/${USER_ROUTER}/get_user_data_by_name`,
            {
                method: "POST",
                body: JSON.stringify({ name: username }),
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            }
        );
        handleBadResponse(response);
        return response.json();
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Fetches the list of users for the admin. Requires admin/god privileges.
 *
 * @returns {Promise<User[]>} A promise that resolves to the JSON response containing the list of users.
 *
 * @throws Will throw an error if the fetch request fails or if the response is not ok.
 */
export const fetchUsersForAdmin = async (): Promise<User[]> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/${USER_ROUTER}/get_users_for_admin`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            }
        );
        handleBadResponse(response);
        return response.json();
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Adds a word to the user's saved words. If the word is already saved, it will not be added again for now (but will not throw, res will be 200), it can be expanded to for example count the number of clicks.
 *
 *
 * @param {string} word - The word to add (text only no prefix postfix objects etc).
 * @param {string} language - The language of the word. Abbreviation, e.g. "en" for English.
 * @param {[number, number, number]} location - The location of the word in the reading.
 * @param {ObjectId} from_reading - The reading from which the word was selected. ObjectId
 * @returns {Promise<Response>} A promise that resolves to the server's response.
 * @throws Will throw an error if the fetch request fails.
 */
export const addSavedWord = async (
    word: string,
    meaning: string,
    language: string,
    location: [number, number, number],
    from_reading: ObjectId
): Promise<Response> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/${USER_ROUTER}/add_saved_word`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    word,
                    meaning,
                    language,
                    location,
                    from_reading,
                }),
                credentials: "include",
            }
        );
        handleBadResponse(response);
        return response.json();
    } catch (error) {
        return handleError(error);
    }
};
/**
 * The function works when called by the user, because it uses the token stored in the browser.
 * @param {string} word - The word to remove (text only no prefix postfix objects etc).
 * @param {string} language - The language of the word. Abbreviation, e.g. "en" for English.
 * @returns {Promise<Response>} A promise that resolves to the server's response.
 * @throws Will throw an error if the fetch request fails.
 *
 **/
export const removeSavedWord = async (
    word: string,
    language: string
): Promise<Response> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/${USER_ROUTER}/remove_saved_word`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ word, language }),
                credentials: "include",
            }
        );
        handleBadResponse(response);
        return response.json();
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Fetches the saved words for the current user.
 *
 * @returns {Promise<SavedWord[]>} A promise that resolves to the saved words data.
 * @throws Will throw an error if the fetch operation fails.
 */
export const getSavedWords = async (): Promise<SavedWord[]> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/${USER_ROUTER}/get_saved_words`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            }
        );
        handleBadResponse(response);
        return response.json();
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Updates the translation cache for a specific reading and sentence address.
 *
 * @param {ObjectId} reading - The ID of the reading to update.
 * @param {[number, number]} sentence_adress - The address of the sentence in the format [paragraphIndex, sentenceIndex].
 * @param {string} translation - The new translation to cache.
 * @returns {Promise<Response>} A promise that resolves to the response of the fetch request.
 */
export const updateReadingTranslationCache = async (
    reading_id: ObjectId,
    sentence_adress: [number, number],
    translation: string
): Promise<Response> => {
    try {
        const answer = await fetch(
            `${API_BASE_URL}/${READING_ROUTER}/update_reading_translation_cache`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    reading_id,
                    sentence_adress,
                    translation,
                }),
                credentials: "include",
            }
        );
        return answer.json();
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Sends a POST request to add a clicked word to the server. The clicked word is added to the reading object.
 *
 * @param {ObjectId} reading - The ID of the reading.
 * @param {[number, number, number]} location - The location of the clicked word in the format [x, y, z].
 * @returns {Promise<Response>} The response from the server as a JSON object.
 * @throws Will throw an error if the request fails.
 */
export const addClickedWord = async (
    reading: ObjectId,
    location: [number, number, number]
): Promise<Response> => {
    try {
        console.log("Adding clicked word to reading:", reading, location);
        const response = await fetch(
            `${API_BASE_URL}/${USER_ROUTER}/add_clicked_word`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ reading, location }),
                credentials: "include",
            }
        );
        console.log("Response from addClickedWord:", response);
        handleBadResponse(response);
        return response.json();
    } catch (error) {
        return handleError(error);
    }
};
/**
 * Updates the knowledge level of a saved word. Locates by text and language.
 * Will be updated to use a spaced repetition algorithm in the future.
 * @param text - The text of the word to be updated.
 * @param language - The language of the word to be updated.
 * @param knowledge_level - The new knowledge level of the word.
 * @returns {Promise<Response>} A promise that resolves to the response JSON.
 * @throws Will throw an error if the fetch request fails.
 */
export const updateSavedWord = async (
    text: string,
    language: string,
    knowledge_level: number,
    interval: number,
    easinessFactor: number,
    repetitions: number,
    dueDate: Date,
    lastReviewed: Date
): Promise<Response> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/${USER_ROUTER}/update_saved_word`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text,
                    language,
                    knowledge_level,
                    interval,
                    easinessFactor,
                    repetitions,
                    dueDate,
                    lastReviewed,
                }),
                credentials: "include",
            }
        );
        handleBadResponse(response);
        return response.json();
    } catch (error) {
        return handleError(error);
    }
};
/**
 * Updates the favourite flag of a saved word. Locates by text and language.
 * @param text - The text of the word.
 * @param language - The language of the word.
 * @param favourite - The new favourite flag of the word.
 * @returns {Promise<Response>} A promise that resolves to the response JSON.
 * @throws Will throw an error if the fetch request fails.
 */
export const updateStar = async (
    text: string,
    language: string,
    favourite: boolean
): Promise<Response> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/${USER_ROUTER}/update_star_saved_word`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text, language, favourite }),
                credentials: "include",
            }
        );
        handleBadResponse(response);
        return response.json();
    } catch (error) {
        return handleError(error);
    }
};
/**
 * Removes a clicked word from the reading object at the specified location.
 *
 * @param reading - The reading object from which the word should be removed.
 * @param location - A tuple representing the location of the word to be removed.
 * @returns {Promise<Response>} A promise that resolves to the response JSON.
 * @throws Will throw an error if the fetch request fails.
 */
export const removeClickedWord = async (
    reading: ObjectId,
    location: [number, number, number]
): Promise<Response> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/${USER_ROUTER}/remove_clicked_word`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ reading, location }),
                credentials: "include",
            }
        );
        handleBadResponse(response);
        return response.json();
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Fetches the clicked words for a given reading object.
 *
 * @param {ObjectId} reading - ObjectId The reading object containing the necessary data.
 * @return {Promise<[[number, number, number]]>} A promise that resolves to the response JSON containing the clicked words.
 * @throws Will throw an error if the fetch request fails.
 */
export const getClickedWords = async (
    reading: ObjectId
): Promise<[[number, number, number]]> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/${USER_ROUTER}/get_clicked_words`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ reading }),
                credentials: "include",
            }
        );
        handleBadResponse(response);
        return response.json();
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Adds premium status to the current user.
 *
 * @returns {Promise<Response>} A promise that resolves to the JSON response from the server.
 * @throws Will throw an error if the request fails.
 */
export const addPremiumToCurrentUser = async (): Promise<Response> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/${USER_ROUTER}/add_premium_to_current_user`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            }
        );
        handleBadResponse(response);
        return response.json();
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Removes the premium status from the current user.
 *
 * @param {string} name - The name of the user whose premium status is to be removed.
 * @returns {Promise<Response>} A promise that resolves to the response of the API call.
 * @throws Will throw an error if the API call fails.
 */
export const removePremiumFromCurrentUser = async (
    name: string
): Promise<Response> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/${USER_ROUTER}/remove_premium`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name }),
                credentials: "include",
            }
        );
        handleBadResponse(response);
        return response.json();
    } catch (error) {
        return handleError(error);
    }
};

/**
 * Updates the user preferences and profile information.
 *
 * @param preferences - An object containing the user's preferences.
 * @param profile - An object containing the user's profile information.
 * @param name - The name of the user.
 * @returns A promise that resolves to the response of the update request.
 * @throws Will throw an error if the request fails.
 */
export const updateUserpreferences = async (
    preferences: object,
    profile: object,
    name: string
): Promise<Response> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/${USER_ROUTER}/update_user_profile_preferences`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ preferences, profile, name }),
                credentials: "include",
            }
        );
        handleBadResponse(response);
        return response.json();
    } catch (error) {
        return handleError(error);
    }
};
export const updateCurrentUserProfilePicture = async (
    profilePicture: File
): Promise<Response> => {
    try {
        const formData = new FormData();
        formData.append("profilePicture", profilePicture);
        const response = await fetch(
            `${API_BASE_URL}/${USER_ROUTER}/update_current_user_profile_picture`,
            {
                method: "PATCH",
                body: formData,
                credentials: "include",
            }
        );
        handleBadResponse(response);
        return response.json();
    } catch (error) {
        return handleError(error);
    }
};

export default {
    uploadReading,
    fetchReading,
    fetchCurrentUserReadings,
    fetchPublicReadings,
    importPublicReadingToUser,
    deleteReading,
    loginUser,
    registerUser,
    addSavedWord,
    removeSavedWord,
    updateSavedWord,
    getSavedWords,
    addClickedWord,
    removeClickedWord,
    getClickedWords,
    fetchCurrentUserData,
    fetchUserDataById,
    fetchUserDataByName,
    fetchUsersForAdmin,
    addPremiumToCurrentUser,
    removePremiumFromCurrentUser,
    updateUserpreferences,
    getReadingQuizData,
    putQuizData,
    updateQuizQuestion,
    updateReadingTranslationCache,
    updateStar,
    updateCurrentUserProfilePicture,
    fetchUserPublicReadingsByName,
};
