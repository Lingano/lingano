const express = require("express");
const router = express.Router();
const User = require("../models/user");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const util = require("util");
const jwtVerify = util.promisify(jwt.verify);
const Reading = require("../models/reading");
// const isGod = require("../routes/auth").isGod;
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
require("dotenv").config();

// Use AWS SDK v3
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
//
const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.AWS_BUCKET_NAME,
        key: (req, file, cb) => {
            console.log("Multer S3 Key Function - File:", {
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
            });
            cb(
                null,
                `uploads/profile_pictures/${Date.now().toString()}-${
                    file.originalname
                }`
            );
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
}).single("profilePicture");

/* GET users listing. */
router.get("/", async (req, res, next) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({
            message: "there is something wrong in api/routes/users.js",
        });
    }
});

router.post("/add_saved_word", async (req, res) => {
    const { word, location, meaning, language, from_reading } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    }

    try {
        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;

        // Fetch user data
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Construct word object
        const wordObject = {
            text: word,
            meaning: meaning,
            language: language,
            knowledge_level: 0,
            location: location,
            from_reading: from_reading,
            favourite: false,
            interval: 1,
            easinessFactor: 2.5,
            repetitions: 0,
            dueDate: new Date(),
            lastReviewed: new Date(),
        };

        console.log("wordObject: ", wordObject);

        // Check if word already exists
        const wordExists = user.saved_words.some(
            (savedWord) =>
                savedWord.text === word && savedWord.language === language
        );

        if (wordExists) {
            console.log("Word already exists");
            return res.status(409).json({ message: "Word already exists" }); // Use 409 Conflict
        }

        // Update user's saved words
        await User.findByIdAndUpdate(
            req.user.id,
            { $push: { saved_words: wordObject } },
            { new: true }
        );

        return res.status(200).json({ message: "Word added successfully" });
    } catch (err) {
        console.error("Error adding saved word:", err.message);

        if (err.name === "JsonWebTokenError") {
            return res.status(400).json({ message: "Invalid token" });
        }

        return res
            .status(500)
            .json({ message: "Server error", error: err.message });
    }
});

router.post("/remove_saved_word", async (req, res, next) => {
    const { word, language } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;

        const user_data = await User.findById(req.user.id).select("-password");

        if (!user_data) {
            return res.status(404).json({ message: "User not found" });
        }

        const wordExists = user_data.saved_words.some(
            (savedWord) =>
                savedWord.text === word && savedWord.language === language
        );

        if (!wordExists) {
            return res.status(200).json({ message: "Word does not exist" });
        }

        await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { saved_words: { text: word, language: language } } },
            { new: true }
        );

        return res.status(200);
    } catch (err) {
        res.status(400).json({ message: "Token is not valid" });
    }
});

router.get("/get_saved_words", async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        const user_data = await User.findById(req.user.id).select("-password");

        if (!user_data) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user_data.saved_words);
    } catch (err) {
        res.status(400).json({ message: "Token is not valid" });
    }
});

router.patch("/update_saved_word", async (req, res, next) => {
    const {
        text,
        language,
        knowledge_level,
        interval,
        easinessFactor,
        repetitions,
        dueDate,
        lastReviewed,
    } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;

        const user_data = await User.findById(req.user.id).select("-password");

        if (!user_data) {
            return res.status(404).json({ message: "User not found" });
        }

        const wordExists = user_data.saved_words.some(
            (savedWord) =>
                savedWord.text === text && savedWord.language === language
        );

        if (!wordExists) {
            return res.status(200).json({ message: "Word does not exist" });
        }

        const updateFields = {};
        if (knowledge_level !== undefined)
            updateFields["saved_words.$.knowledge_level"] = knowledge_level;
        if (interval !== undefined)
            updateFields["saved_words.$.interval"] = interval;
        if (easinessFactor !== undefined)
            updateFields["saved_words.$.easinessFactor"] = easinessFactor;
        if (repetitions !== undefined)
            updateFields["saved_words.$.repetitions"] = repetitions;
        if (dueDate !== undefined)
            updateFields["saved_words.$.dueDate"] = dueDate;
        if (lastReviewed !== undefined)
            updateFields["saved_words.$.lastReviewed"] = lastReviewed;

        await User.updateOne(
            {
                _id: req.user.id,
                "saved_words.text": text,
                "saved_words.language": language,
            },
            { $set: updateFields }
        );

        return res.status(200).json({ message: "Word updated successfully" });
    } catch (err) {
        res.status(400).json({ message: "Token is not valid" });
    }
});

router.patch("/update_star_saved_word", async (req, res, next) => {
    const { text, language, favourite } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;

        const user_data = await User.findById(req.user.id).select("-password");

        if (!user_data) {
            return res.status(404).json({ message: "User not found" });
        }

        const wordExists = user_data.saved_words.some(
            (savedWord) =>
                savedWord.text === text && savedWord.language === language
        );

        if (!wordExists) {
            return res.status(200).json({ message: "Word does not exist" });
        }

        await User.updateOne(
            {
                _id: req.user.id,
                "saved_words.text": text,
                "saved_words.language": language,
            },
            { $set: { "saved_words.$.favourite": favourite } }
        );

        return res.status(200);
    } catch (err) {
        res.status(400).json({ message: "Token is not valid" });
    }
});

router.post("/add_clicked_word", async (req, res, next) => {
    const { reading, location } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    }

    try {
        // Verify JWT and extract user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;

        // Check if user exists
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update clicked words directly
        const clicked_word = [location[0], location[1], location[2]];
        const updateResult = await User.findOneAndUpdate(
            {
                _id: req.user.id,
                "readings.reading_id": reading,
                "readings.clicked_words": { $ne: clicked_word }, // Avoid duplicates
            },
            {
                $push: {
                    "readings.$.clicked_words": clicked_word,
                },
            },
            { new: true } // Return updated document
        );

        // Handle cases where reading is not found or word exists
        if (!updateResult) {
            return res.status(400).json({
                message: "Reading not found or word already exists",
            });
        }

        return res
            .status(200)
            .json({ message: "Clicked word added successfully" });
    } catch (err) {
        console.error("Error adding clicked word:", err.message);
        if (err.name === "JsonWebTokenError") {
            return res
                .status(400)
                .json({ message: "Invalid token", error: err.message });
        }
        return res
            .status(500)
            .json({ message: "Server error", error: err.message });
    }
});

router.post("/remove_clicked_word", async (req, res, next) => {
    const { reading, location } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;

        const user_data = await User.findById(req.user.id).select("-password");

        if (!user_data) {
            return res.status(404).json({ message: "User not found" });
        }

        // update the clicked_words array in the user's reading
        const clicked_word = [location[0], location[1], location[2]];

        const readingData = await User.findOne(
            { _id: req.user.id, "readings.reading_id": reading },
            { "readings.$": 1 }
        );

        if (!readingData) {
            return res.status(404).json({ message: "Reading not found" });
        }

        const clickedWords = readingData.readings[0].clicked_words;
        const wordExists = clickedWords.some(
            (word) =>
                word[0] === location[0] &&
                word[1] === location[1] &&
                word[2] === location[2]
        );

        if (!wordExists) {
            return res.status(200).json({ message: "Word does not exist" });
        }

        // Use findOneAndUpdate to update the specific reading
        const updateResult = await User.findOneAndUpdate(
            { _id: req.user.id, "readings.reading_id": reading },
            {
                $pull: {
                    "readings.$.clicked_words": clicked_word,
                },
            },
            { new: true }
        );

        if (!updateResult) {
            return res
                .status(404)
                .json({ message: "Reading not found or update failed" });
        }

        return res.status(200);
    } catch (err) {
        res.status(400).json({ message: "Token is not valid", error: err });
    }
});

router.post("/get_clicked_words", async (req, res, next) => {
    const { reading } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;

        const user_data = await User.findById(req.user.id).select("-password");

        if (!user_data) {
            return res.status(404).json({ message: "User not found" });
        }

        const readingData = await User.findOne(
            { _id: req.user.id, "readings.reading_id": reading },
            { "readings.$": 1 }
        );

        if (!readingData) {
            return res.status(404).json({ message: "Reading not found" });
        }

        return res.status(200).json(readingData.readings[0].clicked_words);
    } catch (err) {
        res.status(400).json({ message: "Token is not valid" });
    }
});

router.post("/get_quiz_data_from_reading", async (req, res, next) => {
    const { reading } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;

        const user_data = await User.findById(req.user.id).select("-password");
        if (!user_data) {
            return res.status(404).json({ message: "User not found" });
        }

        const readingData = await User.findOne(
            { _id: req.user.id, "readings.reading_id": reading },
            { "readings.$": 1 }
        );
        if (!readingData) {
            return res.status(404).json({ message: "Reading not found" });
        }

        return res
            .status(200)
            .json(readingData.readings[0].reading_progress.quiz);
    } catch (err) {
        res.status(400).json({ message: "Token is not valid", error: err });
    }
});

router.put("/add_quiz_data_to_reading", async (req, res, next) => {
    const { reading, quizData } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;

        const user_data = await User.findById(req.user.id).select("-password");
        if (!user_data) {
            return res.status(404).json({ message: "User not found" });
        }

        const readingData = await User.findOne(
            { _id: req.user.id, "readings.reading_id": reading },
            { "readings.$": 1 }
        );
        if (!readingData) {
            return res.status(404).json({ message: "Reading not found" });
        }

        const updateResult = await User.findOneAndUpdate(
            { _id: req.user.id, "readings.reading_id": reading },
            {
                $set: {
                    "readings.$.reading_progress.quiz": quizData,
                },
            },
            { new: true }
        );

        if (!updateResult) {
            return res
                .status(404)
                .json({ message: "Reading not found or update failed" });
        }

        return res.status(200);
    } catch (err) {
        res.status(400).json({ message: "Token is not valid", error: err });
    }
});

router.patch("/update_one_quiz_question", async (req, res) => {
    const { reading, questionIndex, question } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    }

    try {
        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;

        // Check if user exists
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update the specific question directly
        const updateResult = await User.findOneAndUpdate(
            {
                _id: req.user.id,
                "readings.reading_id": reading,
            },
            {
                $set: {
                    [`readings.$.reading_progress.quiz.questions.${questionIndex}`]:
                        question,
                    "readings.$.reading_progress.quiz.current": questionIndex,
                },
            },
            { new: true } // Return updated document
        );

        // Handle cases where reading or question doesn't exist
        if (!updateResult) {
            return res
                .status(404)
                .json({ message: "Reading not found or update failed" });
        }

        return res
            .status(200)
            .json({ message: "Quiz question updated successfully" });
    } catch (err) {
        console.error("Error updating quiz question:", err.message);

        if (err.name === "JsonWebTokenError") {
            return res.status(400).json({ message: "Invalid token" });
        }

        return res
            .status(500)
            .json({ message: "Server error", error: err.message });
    }
});

router.get("/get_user_data", async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        const user_data = await User.findById(req.user.id).select("-password");

        if (!user_data) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user_data);
    } catch (err) {
        res.status(400).json({ message: "Token is not valid" });
    }
});

router.post("/get_user_data_by_name", async (req, res, next) => {
    const { name } = req.body;
    try {
        const user_data = await User.findOne({ name })
            .select("-password")
            .populate("readings.reading_id", "title author");

        if (!user_data) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user_data);
    } catch (err) {
        res.status(400).json({ message: "Token is not valid" });
    }
});

// router.post("/get_user_public_profile", async (req, res, next) => {
//     const { name } = req.body;
//     try {
//         // find the user by name and populate the readings array with their public readings
//         const user_data = await User.findOne({ name })
//             .select("-password")
//             .populate("readings.reading_id", "title author public");

//         if (!user_data) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         return res.status(200).json(user_data);
//     } catch (err) {
//         res.status(400).json({ message: "Token is not valid" });
//     }
// });

router.post("/update_user_data", async (req, res, next) => {
    const { FieldsToUpdate, UpdatedData } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;

        const user_data = await User.findById(req.user.id).select("-password");

        if (!user_data) {
            return res.status(404).json({ message: "User not found" });
        }

        const updated_user_data = await User.findByIdAndUpdate(
            req.user.id,
            { [FieldsToUpdate]: UpdatedData },
            { new: true }
        );

        return res.status(200).json(updated_user_data);
    } catch (err) {
        res.status(400).json({ message: "Token is not valid" });
    }
});

router.post("/update_user_profile_picture", async (req, res, next) => {
    const { profile_picture } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;

        const user_data = await User.findById(req.user.id).select("-password");

        if (!user_data) {
            return res.status(404).json({ message: "User not found" });
        }

        const updated_user_data = await User.findByIdAndUpdate(
            req.user.id,
            { profile_picture: profile_picture },
            { new: true }
        );

        return res.status(200).json(updated_user_data);
    } catch (err) {
        res.status(400).json({ message: "Token is not valid" });
    }
});

router.post("/update_user_data_by_name", async (req, res, next) => {
    const { name, FieldsToUpdate, UpdatedData } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;

        const user_data = await User.findOne({ name }).select("-password");

        if (!user_data) {
            return res.status(404).json({ message: "User not found" });
        }

        const updated_user_data = await User.findOneAndUpdate(
            { name },
            { [FieldsToUpdate]: UpdatedData },
            { new: true }
        );

        return res.status(200).json(updated_user_data);
    } catch (err) {
        res.status(400).json({ message: "Token is not valid" });
    }
});

router.get("/get_users_for_admin", async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        const user_data = await User.findById(req.user.id).select("-password");

        if (!user_data) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user_data.god_mode) {
            console.log("User is not god");
            // return res.status(401).json({ message: "Unauthorized" });
        }

        const users = await User.find().select("-password");

        return res.status(200).json(users);
    } catch (err) {
        res.status(400).json({ message: "Token is not valid" });
    }
});

router.patch("/update_user_profile_preferences", async (req, res, next) => {
    const { preferences, profile, name } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;

        const user_data = await User.findById(req.user.id).select("-password");

        if (!user_data) {
            return res.status(404).json({ message: "User not found" });
        }

        const updatedFields = {};
        if (preferences) {
            updatedFields["preferences"] = {
                ...user_data.preferences.toObject(),
                ...preferences,
            };
        }
        if (profile) {
            const { profile_picture, ...restProfile } = profile;
            updatedFields["profile"] = {
                ...user_data.profile.toObject(),
                ...restProfile,
            };
        }
        if (name) {
            await User.findByIdAndUpdate(
                req.user.id,
                { name: name },
                { new: true }
            );
        }

        const updated_user_data = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updatedFields },
            { new: true }
        );

        return res.status(200).json(updated_user_data);
    } catch (err) {
        res.status(400).json({ message: "Token is not valid", error: err });
    }
});

// router.patch(
//     "/update_current_user_profile_picture",
//     (req, res, next) => {
//         upload(req, res, function (err) {
//             console.log("Multer Upload Middleware:");
//             console.log("Error:", err);
//             console.log("Request Body:", req.body);
//             console.log("Request File:", req.file);

//             if (err instanceof multer.MulterError) {
//                 return res.status(500).json({
//                     message: "Multer Upload Error",
//                     error: err.message,
//                 });
//             } else if (err) {
//                 return res.status(500).json({
//                     message: "Unknown Upload Error",
//                     error: err.message,
//                 });
//             }
//             next();
//         });
//     },
//     async (req, res, next) => {
//         const { profile_picture } = req.body;
//         const token = req.cookies.token;

//         if (!token) {
//             return res
//                 .status(401)
//                 .json({ message: "No token, authorization denied" });
//         }
//         try {
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);
//             req.user = decoded.user;

//             const user_data = await User.findById(req.user.id).select(
//                 "-password"
//             );
//             if (!user_data) {
//                 return res.status(404).json({ message: "User not found" });
//             }

//             const updated_user_data = await User.findByIdAndUpdate(
//                 req.user.id,
//                 { "profile.profile_picture": profile_picture },
//                 { new: true }
//             );

//             return res.status(200).json(updated_user_data);
//         } catch (err) {
//             res.status(400).json({ message: "Token is not valid" });
//         }
//     }
// );
router.patch(
    "/update_current_user_profile_picture",
    (req, res, next) => {
        const token = req.cookies.token;

        if (!token) {
            return res
                .status(401)
                .json({ message: "No token, authorization denied" });
        }
        next();
    },
    (req, res, next) => {
        upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(500).json({
                    message: "Multer Upload Error",
                    error: err.message,
                });
            } else if (err) {
                return res.status(500).json({
                    message: "Unknown Upload Error",
                    error: err.message,
                });
            }
            next();
        });
    },
    async (req, res, next) => {
        try {
            const token = req.cookies.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded.user;

            const user_data = await User.findById(req.user.id).select(
                "-password"
            );
            if (!user_data) {
                return res.status(404).json({ message: "User not found" });
            }

            // Delete the old profile picture from S3
            const oldProfilePicture = user_data.profile.profile_picture;
            if (
                oldProfilePicture &&
                !oldProfilePicture.includes("default_icon")
            ) {
                const params = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: oldProfilePicture.split(".com/")[1],
                };
                await s3Client.send(new DeleteObjectCommand(params));
            }

            // Update the user profile with the new profile picture URL
            const newProfilePicture = req.file.location;
            const updated_user_data = await User.findByIdAndUpdate(
                req.user.id,
                { "profile.profile_picture": newProfilePicture },
                { new: true }
            );

            return res.status(200).json(updated_user_data);
        } catch (err) {
            res.status(400).json({ message: "Token is not valid", error: err });
        }
    }
);

router.delete("/delete_my_account", async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        const user_data = await User.findById(req.user.id).select("-password");

        if (!user_data) {
            return res.status(404).json({ message: "User not found" });
        }

        // go through all readings and remove the user from the users array
        const readings = await Reading.find({ "users.user_id": req.user.id });
        console.log("readings: ", readings);
        if (readings) {
            readings.forEach(async (reading) => {
                reading.users = reading.users.filter(
                    (user) => user.user_id.toString() !== req.user.id.toString()
                );
                await reading.save();
            });
        }

        // go through all readings that the user is the owner of and delete them
        const readings_owner = await Reading.find({ owner: req.user.id });
        console.log("readings owned: ", readings_owner);
        if (readings_owner) {
            readings_owner.forEach(async (reading) => {
                await reading.deleteOne();
            });
        }
        await User.findByIdAndDelete(req.user.id);

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(400).json({ message: "Token is not valid" });
    }
});

router.delete("/delete_user_by_name", async (req, res, next) => {
    const { name } = req.body;
    try {
        const user = await User.findOneAndDelete({ name });
        // find all readings that the user is in and remove his id from the users array
        const readings = await Reading.find({ "users.user_id": user._id });
        readings.forEach(async (reading) => {
            reading.users = reading.users.filter(
                (user) => user.user_id.toString() !== user._id.toString()
            );
            await reading.save();
        });

        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(400).json({
            message:
                "ERROR DELETING USER - there is something wrong in api/routes/users.js",
            error: err,
        });
    }
});

router.post("/add_premium_to_current_user", async (req, res, next) => {
    // use token cookie
    const token = req.cookies.token;
    if (!token) {
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;

        const user_data = await User.findById(req.user.id).select("-password");

        if (!user_data) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = await User.findOneAndUpdate(
            { _id: req.user.id },
            { premium: true },
            { new: true }
        );

        return res.status(200).json({ message: "User updated" });
    } catch (err) {
        res.status(400).json({ message: "Token is not valid" });
    }
});

router.post("/remove_premium_from_user", async (req, res, next) => {
    const { name } = req.body;
    try {
        const user = await User.findOneAndUpdate(
            { name },
            { premium: false },
            { new: true }
        );
        res.status(200).json({ message: "User updated successfully" });
    } catch (err) {
        res.status(400).json({
            message:
                "ERROR UPDATING USER - there is something wrong in api/routes/users.js",
            error: err,
        });
    }
});
module.exports = router;
