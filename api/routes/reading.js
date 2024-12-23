const express = require("express");
const router = express.Router();
const Reading = require("../models/reading");
const User = require("../models/user");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const util = require("util");
const { get } = require("http");
const { read } = require("fs");
const jwtVerify = util.promisify(jwt.verify);

async function getNameFromId(id) {
    const user = await User.findById(id);
    return user.name;
}

function isEndOfSentence(word) {
    // Check if the word ends with a sentence-ending punctuation followed by optional quotation marks or special characters
    // contains .!? but not ...
    return /[.!?]["'”»]?$/u.test(word) && !/\.{3}["'”»]?$/.test(word);
}

function trimSpecialCharacters(word) {
    const frontMatch = word.match(/^[.,;:!?'"“«\[\(\{]+/);
    const backMatch = word.match(/[.,;:!?'"”»\]\)\}]+$/);
    const trimmedWord = word.replace(
        /^[.,;:!?'"“«\[\(\{]+|[.,;:!?'"”»\]\)\}]+$/g,
        ""
    );
    const frontCharacters = frontMatch ? frontMatch[0] : "";
    const backCharacters = backMatch ? backMatch[0] : "";
    return { trimmedWord, frontCharacters, backCharacters };
}

// Helper function to process text into sentences and paragraphs
function processTextIntoSentences(text) {
    if (!text) return [];
    const paragraphs = text
        .split(/\n+/)
        .filter((paragraph) => paragraph.trim() !== "");

    const formatted = [];

    paragraphs.forEach((paragraph, paragraph_index) => {
        // initialize paragraph array
        formatted[paragraph_index] = [];
        // space seperated entities
        const word_entities = paragraph.split(" ");
        let sentence_index = 0;

        word_entities.forEach((word) => {
            // if sentence array does not exist yet, create it
            if (!formatted[paragraph_index][sentence_index])
                formatted[paragraph_index][sentence_index] = [];

            // Trim special characters from both front and end of the word
            const { trimmedWord, frontCharacters, backCharacters } =
                trimSpecialCharacters(word);
            const word_formatted = {
                prefix: frontCharacters,
                text: trimmedWord,
                postfix: backCharacters,
            };

            formatted[paragraph_index][sentence_index].push(word_formatted);

            if (isEndOfSentence(word)) ++sentence_index;
        });

        // const sentences = paragraph
        //     .split(/([.!?])/)
        //     .filter((sentence) => sentence.trim() !== "");
        // const paragraphArray = [];

        // for (let i = 0; i < sentences.length; i += 2) {
        //     const sentence = sentences[i];
        //     const separator = sentences[i + 1] || "";
        //     const words = sentence
        //         .split(/(\s+|[.,;:!?])/)
        //         .filter((word) => word.trim() !== "");
        //     const sentenceArray = words
        //         .map((word, index) => {
        //             const prefix =
        //                 index > 0
        //                     ? words[index - 1].match(/^[.,;:!?]/)
        //                         ? words[index - 1]
        //                         : ""
        //                     : "";
        //             const postfix =
        //                 index === words.length - 1
        //                     ? separator
        //                     : words[index + 1]?.match(/^[.,;:!?]/)
        //                     ? words[index + 1]
        //                     : "";
        //             if (postfix === ",") {
        //                 words[index + 1] = "";
        //             }
        //             return { prefix: prefix, text: word, postfix: postfix };
        //         })
        //         .filter((wordObj) => wordObj.text.trim() !== "");
        //     paragraphArray.push(sentenceArray);
        // }
        // console.log("this is a paragraph array: ", paragraphArray);

        // formatted.push(paragraphArray);
    });

    return formatted;
}

/**
 * Creates a translation cache for the given text.
 * The cache is structured as an array of paragraphs,
 * where each paragraph is an array of empty strings representing sentences.
 *
 * Could be improved to not use processTextIntoSentences the second time but now it will have to do
 *
 * @param {string} text - The text to be processed into a translation cache.
 * @returns {Array<Array<string>>} The translation cache with the same structure as the input text.
 */
function createTranslationCache(text) {
    const formatted = processTextIntoSentences(text);
    const translation_cache = [];
    formatted.forEach((paragraph) => {
        const paragraphArray = [];
        paragraph.forEach((sentence) => {
            paragraphArray.push("");
        });
        translation_cache.push(paragraphArray);
    });
    return translation_cache;
}

function getLanguageStringFromCode(code) {
    switch (code) {
        case "en":
            return "English";
        case "es":
            return "Spanish";
        case "fr":
            return "French";
        case "de":
            return "German";
        case "it":
            return "Italian";
        case "pt":
            return "Portuguese";
        case "nl":
            return "Dutch";
        case "pl":
            return "Polish";
        case "ru":
            return "Russian";
        case "ja":
            return "Japanese";
        case "ko":
            return "Korean";
        case "zh":
            return "Chinese";
        default:
            return "Unknown";
    }
}

// GET route: Returns a reading object by ID
router.post("/get", async (req, res) => {
    const { id } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Authorization token missing" });
    }

    try {
        // Verify and decode the token
        const decoded_token = await jwtVerify(token, process.env.JWT_SECRET);
        const userId = decoded_token.user?.id;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res
                .status(400)
                .json({ message: "Invalid user ID in token" });
        }

        const objectId = new mongoose.Types.ObjectId(userId);
        const db = mongoose.connection;

        // Find the reading by owner ID and internal user ID
        const reading = await db.collection("readings").findOne({
            owner: objectId,
            internal_user_id: id,
        });

        if (!reading) {
            const publicReading = await db.collection("readings").findOne({
                users: {
                    $elemMatch: { user_id: objectId, reading_internal_id: id },
                },
                public_access: true,
            });
            return res.status(200).json(publicReading);
        }

        if (!reading) {
            return res.status(404).json({ message: "Reading not found" });
        }

        return res.status(200).json(reading);
    } catch (error) {
        console.error("Error fetching reading:", error);
        return res
            .status(500)
            .json({ message: "Error fetching reading", error: error.message });
    }
});

router.post("/import_public_reading", async (req, res) => {
    const { owner, id } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Authorization token missing" });
    }

    try {
        // Verify and decode the token
        const decoded_token = await jwtVerify(token, process.env.JWT_SECRET);
        const userId = decoded_token.user?.id;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res
                .status(400)
                .json({ message: "Invalid user ID in token" });
        }

        const objectId = mongoose.Types.ObjectId.createFromHexString(userId);
        const db = mongoose.connection;

        // Find the reading by owner ID and internal user ID
        let reading = await db.collection("readings").findOne({
            owner: mongoose.Types.ObjectId.createFromHexString(owner),
            internal_user_id: id,
            public_access: true,
        });

        // Check if the user already has that reading by checking the users array if it contains the user id
        const existingReading = await reading.users.find(
            (user) => user.user_id.toString() === userId
        );

        if (existingReading) {
            return res
                .status(400)
                .json({ message: "Reading is already in your library" });
        }
        if (!reading) {
            return res.status(404).json({ message: "Reading not found" });
        }

        // create a new internal user id for the reading based on the user's reading count and the availability of the id
        // you check the readings array inside the user
        let userReadingCount = await User.findById(userId).countDocuments({
            readings: { $exists: true },
        });

        // check if the id is already in use
        let reading_internal_id = userReadingCount + 1;
        while (
            await User.findOne({
                readings: {
                    $elemMatch: {
                        reading_internal_id: reading_internal_id,
                    },
                },
            })
        ) {
            reading_internal_id++;
        }

        let readingObject = {
            owner: false,
            reading_internal_id: reading_internal_id,
            reading_progress: { quiz: {} },
            reading_id: reading._id,
            clicked_words: [],
        };

        let userObject = {
            user_id: userId,
            reading_internal_id: reading_internal_id,
        };

        await User.findByIdAndUpdate(userId, {
            $push: { readings: readingObject },
        });

        await Reading.findByIdAndUpdate(reading._id, {
            $push: { users: userObject },
        });

        reading = await Reading.findById(reading._id);

        return res
            .status(200)
            .json({ userId: userId, reading_internal_id: reading_internal_id });
    } catch (error) {
        console.error("Error fetching reading:", error);
        return res
            .status(500)
            .json({ message: "Error fetching reading", error: error.message });
    }
});

// POST route: Creates and returns a new reading object
router.post("/", async (req, res) => {
    const { title, text, public, language, category } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Authorization token missing" });
    }

    try {
        // Verify and decode the token
        const decoded_token = await jwtVerify(token, process.env.JWT_SECRET);
        const ownerId = decoded_token.user?.id;

        if (!ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) {
            return res
                .status(400)
                .json({ message: "Invalid user ID in token" });
        }

        const objectId = new mongoose.Types.ObjectId(ownerId);
        const db = mongoose.connection;

        // get the users reading count by checking the length of the readings array
        // Ensure the internal user ID is unique
        // let uniqueId = userReadingCount + 1;
        // while (
        //     await db
        //         .collection("readings")
        //         .findOne({ owner: objectId, internal_user_id: uniqueId })
        // ) {
        //     uniqueId++;
        // }

        let userReadingCount = await db
            .collection("readings")
            .countDocuments({ owner: objectId });

        // Prepare the reading data
        const readingData = {
            id: userReadingCount + 1,
            owner_id: objectId,
            owner_name: await getNameFromId(ownerId),
            users: [],
            title: title || `Reading ${userReadingCount + 1}`,
            category: category || "General",
            formatted_text: processTextIntoSentences(text),
            original_text: text,
            language: getLanguageStringFromCode(language),
            public_access: public === true,
        };

        // Create the reading document
        const reading = new Reading({
            internal_user_id: readingData.id,
            owner: readingData.owner_id,
            owner_name: readingData.owner_name,
            users: [],
            title: readingData.title,
            category: readingData.category,
            formatted_text: readingData.formatted_text,
            text: readingData.original_text,
            language: language,
            translation_cache: createTranslationCache(text),
            public_access: public,
        });

        let readingObject = {
            owner: true,
            reading_internal_id: readingData.id,
            reading_progress: { quiz: {} },
            clicked_words: [],
            reading_id: reading._id,
        };

        // Save the reading and update the user's document
        await db.collection("readings").insertOne(reading);
        await User.findByIdAndUpdate(ownerId, {
            $push: { readings: readingObject },
        }).populate("readings");

        return res.status(201).json(reading);
    } catch (error) {
        console.error("Error saving reading:", error);
        return res.status(500).json({
            message:
                "Error saving reading, consult postman or localhost:9000 for api documentation",
            error: error.message,
        });
    }
});
// this should maybe include the possibility to get readings of not only the user that calls but also of other users by their id, but maybe its for the admin panel or something
router.get("/get_all_current_user_readings", async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Authorization token missing" });
    }

    try {
        // Verify and decode the token
        const decoded_token = await jwtVerify(token, process.env.JWT_SECRET);
        const userId = decoded_token.user?.id;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res
                .status(400)
                .json({ message: "Invalid user ID in token" });
        }

        const objectId = new mongoose.Types.ObjectId(userId);
        const db = mongoose.connection;

        // Find the user's readings
        const readings = await db
            .collection("readings")
            .find({ owner: objectId })
            .toArray();

        const publicReadings = await db
            .collection("readings")
            .find({ users: { $elemMatch: { user_id: objectId } } })
            .toArray();

        const user = await User.findById(userId);
        // const allReadings = [...readings, ...publicReadings];
        // const allReadings = user.readings;
        const allReadings = [];
        for (const reading of user.readings) {
            const readingData = await Reading.findById(reading.reading_id);
            if (!readingData) {
                continue;
            }
            allReadings.push({
                title: readingData.title,
                excerpt: readingData.text.substring(0, 100) + "...",
                language: readingData.language,
                reading_internal_id: readingData.internal_user_id,
            });
        }

        return res.status(200).json(allReadings);
    } catch (error) {
        console.error("Error fetching readings:", error);
        return res
            .status(500)
            .json({ message: "Error fetching readings", error: error.message });
    }
});

router.post("/get_public_readings_of_a_user", async (req, res) => {
    const { name } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Authorization token missing" });
    }

    try {
        // Verify and decode the token
        const decoded_token = await jwtVerify(token, process.env.JWT_SECRET);
        const userId = decoded_token.user?.id;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res
                .status(400)
                .json({ message: "Invalid user ID in token" });
        }

        const objectId = new mongoose.Types.ObjectId(userId);

        const db = mongoose.connection;

        const user = await User.findOne({ name: name });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const publicReadings = await db
            .collection("readings")
            .find({ owner: user._id, public_access: true })
            .toArray();

        const publicReadingsWithProfilePictures = [];

        for (const reading of publicReadings) {
            const owner = await User.findById(reading.owner);
            publicReadingsWithProfilePictures.push({
                owner_name: user.name,
                profile_picture: owner.profile?.profile_picture || "",
                title: reading.title,
                excerpt: reading.text.substring(0, 100) + "...",
                language: reading.language,
                category: reading.category,
                owner: reading.owner,
                internal_user_id: reading.internal_user_id,
            });
        }

        return res.status(200).json(publicReadingsWithProfilePictures);
    } catch (error) {
        console.error("Error fetching readings:", error);
        return res
            .status(500)
            .json({ message: "Error fetching readings", error: error.message });
    }
});

router.put("/update_reading_translation_cache", async (req, res) => {
    const { reading_id, sentence_adress, translation } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Authorization token missing" });
    }

    try {
        // Verify and decode the token
        const decoded_token = await jwtVerify(token, process.env.JWT_SECRET);
        const userId = decoded_token.user?.id;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res
                .status(400)
                .json({ message: "Invalid user ID in token" });
        }

        const robjectId =
            mongoose.Types.ObjectId.createFromHexString(reading_id);

        const db = mongoose.connection;

        // Find the reading by owner ID and internal user ID
        const reading = await db.collection("readings").findOne({
            _id: new mongoose.Types.ObjectId(reading_id),
        });

        if (!reading) {
            return res.status(404).json({ message: "Reading not found" });
        }

        translation_cache = reading.translation_cache;

        translation_cache[sentence_adress[0]][sentence_adress[1]] = translation;

        await db.collection("readings").updateOne(
            { _id: robjectId },
            {
                $set: {
                    translation_cache: translation_cache,
                },
            }
        );
        // const updated_cache = await db.collection("readings").findOne({
        //     _id: robjectId,
        // });

        // debug
        // console.log(
        //     "current translation_cache: " +
        //         updated_cache.translation_cache[sentence_adress[0]][
        //             sentence_adress[1]
        //         ]
        // );

        // console.log("translation_cache", translation_cache);

        return res.status(200).json({
            message: "Translation cache updated!",
        });
    } catch (error) {
        console.error("Error updating translation cache:", error);
        return res.status(500).json({
            message: "Error updating translation cache",
            error: error.message,
        });
    }
});

router.get("/get_all_public", async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Authorization token missing" });
    }

    const MAX_READINGS_SENT = 15;

    const decoded_token = await jwtVerify(token, process.env.JWT_SECRET);
    const userId = decoded_token.user?.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID in token" });
    }

    const objectId = mongoose.Types.ObjectId.createFromHexString(userId);

    const db = mongoose.connection;

    // Find all public readings
    const readings = await db
        .collection("readings")
        .find({ public_access: true })
        .toArray();

    // Add profile pictures to the readings
    const readingsWithProfilePictures = [];
    for (const reading of readings) {
        const user = await User.findById(reading.owner);
        if (
            !objectId.equals(reading.owner) &&
            readingsWithProfilePictures.length < MAX_READINGS_SENT
        ) {
            readingsWithProfilePictures.push({
                profile_picture: user.profile?.profile_picture || "",
                title: reading.title,
                excerpt: reading.text.substring(0, 100) + "...",
                language: reading.language,
                category: reading.category,
                owner: reading.owner,
                internal_user_id: reading.internal_user_id,
                owner_name: user.name,
            });
        }
    }

    return res.status(200).json(readingsWithProfilePictures);
});

router.delete("/delete", async (req, res) => {
    const { id } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Authorization token missing" });
    }

    try {
        // Verify and decode the token
        const decoded_token = await jwtVerify(token, process.env.JWT_SECRET);
        const userId = decoded_token.user?.id;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res
                .status(400)
                .json({ message: "Invalid user ID in token" });
        }

        const objectId = new mongoose.Types.ObjectId(userId);
        const db = mongoose.connection;

        // Find the reading by owner ID and internal user ID
        let reading = await db.collection("readings").findOne({
            owner: objectId,
            internal_user_id: id,
        });

        if (!reading) {
            console.log("the reading is not found before public: ");
            const publicReading = await db.collection("readings").findOne({
                users: {
                    $elemMatch: { user_id: objectId, reading_internal_id: id },
                },
                public_access: true,
            });
            reading = publicReading;
            if (!publicReading) {
                console.log("the reading is also not found after public!!!")
            }
        }

        if (!reading) {
            return res.status(404).json({ message: "Reading not found" });
        }

        const _id = reading._id;

        // Check if the user is the reading's owner before deleting it entirely
        if (reading.owner.toString() !== userId) {
            // If not the owner, just remove it from the user's readings list
            await User.findByIdAndUpdate(userId, {
                $pull: { readings: { reading_id: _id } },
            });
            await Reading.findByIdAndUpdate(_id, {
                $pull: { users: { user_id: userId } },
            });
            return res
                .status(200)
                .json({ message: "Reading removed from user's list" });
        } else {
            // If the user is the owner, delete the reading entirely
            await db.collection("readings").deleteOne({ _id });

            await User.findByIdAndUpdate(userId, {
                $pull: { readings: { reading_id: _id } },
            });

            return res
                .status(200)
                .json({ message: "Reading deleted completely" });
        }
    } catch (error) {
        console.error("Error deleting reading:", error);
        return res
            .status(500)
            .json({ message: "Error deleting reading", error: error.message });
    }
});

module.exports = router;
