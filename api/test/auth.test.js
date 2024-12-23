const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const authRouter = require("./auth");
const { expect } = require("chai");

const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);

describe("Auth Routes", () => {
    beforeAll(async () => {
        const url = `mongodb://127.0.0.1/auth_test_db`;
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    describe("POST /api/auth/register", () => {
        it("should register a new user", async () => {
            const res = await request(app).post("/api/auth/register").send({
                name: "Test User",
                email: "testuser@example.com",
                password: "password123",
                profilePicture: "profile.jpg",
            });
            expect(res.statusCode).to.equal(200);
            expect(res.body.user_data).to.have.property(
                "email",
                "testuser@example.com"
            );
        });

        it("should not register a user with an existing email", async () => {
            const res = await request(app).post("/api/auth/register").send({
                name: "Test User",
                email: "testuser@example.com",
                password: "password123",
                profilePicture: "profile.jpg",
            });
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual(
                "That email adress is already used by another user. Sign in instead"
            );
        });
    });

    describe("POST /api/auth/login", () => {
        it("should login an existing user", async () => {
            const res = await request(app).post("/api/auth/login").send({
                email: "testuser@example.com",
                password: "password123",
            });
            expect(res.statusCode).toEqual(200);
            expect(res.body.user_data).toHaveProperty(
                "email",
                "testuser@example.com"
            );
        });

        it("should not login with incorrect password", async () => {
            const res = await request(app).post("/api/auth/login").send({
                email: "testuser@example.com",
                password: "wrongpassword",
            });
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual("Incorrect password");
        });

        it("should not login non-existing user", async () => {
            const res = await request(app).post("/api/auth/login").send({
                email: "nonexistinguser@example.com",
                password: "password123",
            });
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual("User not found");
        });
    });

    describe("GET /api/auth/access_user_data", () => {
        it("should access user data with valid token", async () => {
            const user = await User.findOne({ email: "testuser@example.com" });
            const token = jwt.sign(
                { user: { id: user.id } },
                process.env.JWT_SECRET,
                { expiresIn: "9999 years" }
            );

            const res = await request(app)
                .get("/api/auth/access_user_data")
                .set("Authorization", token);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("email", "testuser@example.com");
        });

        it("should not access user data without token", async () => {
            const res = await request(app).get("/api/auth/access_user_data");
            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toEqual("No token, authorization denied");
        });

        it("should not access user data with invalid token", async () => {
            const res = await request(app)
                .get("/api/auth/access_user_data")
                .set("Authorization", "invalidtoken");
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual("Token is not valid");
        });
    });

    describe("POST /api/auth/logout", () => {
        it("should logout the user", async () => {
            const res = await request(app).post("/api/auth/logout");
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual(
                "We might implement token blacklisting if needed for instant bans or something."
            );
        });
    });

    describe("GET /api/auth/password-reset", () => {
        it("should return password reset message", async () => {
            const res = await request(app).get("/api/auth/password-reset");
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual(
                "Password reset to be implemented"
            );
        });
    });
});
