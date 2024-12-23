var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
    // get current time and date
    var currentdate = new Date();

    // format it only for the time, pad seconds with 0 if needed and add AM or PM
    var time =
        currentdate.getHours() +
        ":" +
        (currentdate.getMinutes() < 10 ? "0" : "") +
        currentdate.getMinutes() +
        ":" +
        (currentdate.getSeconds() < 10 ? "0" : "") +
        currentdate.getSeconds() +
        " " +
        (currentdate.getHours() >= 12 ? "PM" : "AM");

    res.send(
        "This is a message that was fetched from our api! The current time is:  " +
            time
    );
});
//
module.exports = router;
