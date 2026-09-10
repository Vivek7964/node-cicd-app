const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.json({
        message: "Hello from Node.js CI/CD!",
        version: "finale.0.1"
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP"
    });
});

module.exports = app;