const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
require("dotenv").config();
const mongoose = require("mongoose");
// const AWS = require("aws-sdk");
const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");

// Use AWS SDK v3
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

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

router.post(
    "/register",
    (req, res, next) => {
        if (
            req.body.profilePicture &&
            typeof req.body.profilePicture === "string"
        ) {
            next();
        } else {
            upload(req, res, function (err) {
                console.log("Multer Upload Middleware:");
                console.log("Error:", err);
                console.log("Request Body:", req.body);
                console.log("Request File:", req.file);

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
        }
    },
    async (req, res) => {
        const { name, email, password, profilePicture } = req.body;
        try {
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({
                    message:
                        "That email address is already used by another user. Sign in instead",
                });
            }

            let profilePictureURL = req.file
                ? req.file.location
                : profilePicture
                ? profilePicture
                : "https://lingano.s3.eu-central-1.amazonaws.com/uploads/profile_pictures/default_icon0.jpeg";

            user = new User({
                name,
                email,
                password,
                readings: [],
                saved_words: [],
                premium: false,
                preferences: {
                    theme: "light",
                    language: "English",
                    notificationsEnabled: true,
                    privacy: {
                        profileVisibility: "public",
                    },
                },
                profile: {
                    profile_picture: profilePictureURL,
                    description: "",
                    languages: [],
                    location: "",
                },
                god_mode: false,
            });
            // hash the password to not store it in plain text
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();

            const payload = {
                user: {
                    id: user.id,
                },
            };
            const user_data_t = await User.findById(user.id)
                .select("-password")
                .exec();
            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: "9999 years" },
                (err, token) => {
                    if (err) throw err;
                    res.cookie("token", token, {
                        httpOnly: false,
                    });
                    res.status(200).json({ user_data: user_data_t });
                }
            );
        } catch (err) {
            res.status(400).json({
                message:
                    "ERROR REGISTERING USER - there is something wrong in api/routes/auth.js",
                error: err,
            });
        }
    }
);

router.post(
    "/login",
    [
        check("email", "Please enter a valid email").isEmail(),
        check("password", "Password is required").exists(),
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        const { email, password } = req.body;
        // check for errors with express-validator
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: "User not found" });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Incorrect password" });
            }
            const payload = {
                user: {
                    id: user.id,
                },
            };
            user_data_t = await User.findById(user.id).select("-password");
            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: "9999 years" },
                (err, token) => {
                    if (err) throw err;
                    res.cookie("token", token, { httpOnly: false });
                    res.status(200).json({ user_data: user_data_t });
                }
            );
        } catch (err) {
            res.status(400).json({
                message:
                    "ERROR LOGGING IN - there is something wrong in api/routes/auth.js",
                error: err,
            });
        }
    }
);

router.get("/access_user_data", async (req, res, next) => {
    // check for the token in the header
    const token = req.header("Authorization");
    if (!token) {
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        const user_data = await User.findById(req.user.id).select("-password");
        res.json(user_data);
    } catch (err) {
        res.status(400).json({ message: "Token is not valid" });
    }
});

// logout actually happens on the client side by deleting the token, and the sever might blacklist the token but that is not implemented here yet
router.post("/logout", async (req, res) => {
    res.status(200).json({
        message:
            "We might implement token blacklisting if needed for instant bans or something.",
    });
});

router.get("/password-reset", async (req, res, next) => {
    res.status(200).json({ message: "Password reset to be implemented" });
});

const isGod = async (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        return res
            .status(401)
            .json({ message: "No token, authorization denied" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        const user_data = await User.findById(req.user.id).select("-password");
        if (!user_data.god_mode) {
            return false;
        }
        return true;
    } catch (err) {
        res.status(400).json({ message: "Token is not valid" });
    }
};

module.exports = router;
