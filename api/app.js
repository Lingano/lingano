var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
// var s3 = require("./config/awsConfig");

var usersRouter = require("./routes/users");
var authRouter = require("./routes/auth");
var readingRouter = require("./routes/reading");
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// https://lingano-84ee656e6285.herokuapp.com
// CORS setup for Heroku and local development
const allowedOrigins = [
    "https://lingano.live",
    "http://localhost:5173",
    "http://localhost:9000",
    "http://lingano.live"
];

// CORS configuration
app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, origin);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        credentials: true,
        maxAge: 86400,
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "Origin",
            "Accept",
            "X-Requested-With"
        ],
        exposedHeaders: ["Content-Range", "X-Content-Range"]
    })
);

// app.options("*", (req, res) => {
//     res.header("Access-Control-Allow-Origin", "http://localhost:5173");
//     res.header("Access-Control-Allow-Origin", "https://www.lingano.live");
//     res.header("Access-Control-Allow-Origin", "https://lingano.live");
//     res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
//     res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//     res.header("Access-Control-Allow-Credentials", "true");
//     res.sendStatus(204);
// });

// Serve static files for React frontend
app.use(
    express.static(path.join(__dirname, "client", "build"), {
        setHeaders: (res, path) => {
            if (path.endsWith(".svg")) {
                res.set("Content-Type", "image/svg+xml");
            }
        },
    })
);
app.use("/static", express.static("public"));

// API routes
app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/reading", readingRouter);

// Catch-all for frontend routing (for React app to handle routes)
app.get("*", (req, res) => {
    const filePath = path.join(__dirname, "client", "build", "index.html");
    console.log(`Serving: ${filePath}`);
    res.sendFile(filePath);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});

// s3.listBuckets((err, data) => {
//     if (err) {
//         console.error("AWS Credentials Test Failed:", err.message);
//     } else {
//         console.log("AWS Credentials Test Passed. Buckets:");
//         console.log(data.Buckets);
//     }
// });

module.exports = app;
