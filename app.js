const express = require("express");
const client = require("@prometheus-io/client");

const app = express();

client.collectDefaultMetrics();

const httpRequestsTotal = new client.Counter({
    name: "nodejs_http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"]
});

app.use((req, res, next) => {

    res.on("finish", () => {

        httpRequestsTotal.inc({
            method: req.method,
            route: req.route?.path || req.path,
            status_code: res.statusCode
        });

    });

    next();
});

app.get("/", (req, res) => {

    res.json({
        message: "Hello from Node.js CI/CD!",
        version: "1.0.2"
    });

});

app.get("/health", (req, res) => {

    res.status(200).json({
        status: "UP"
    });

});

app.get("/metrics", async (req, res) => {

    res.set(
        "Content-Type",
        client.register.contentType
    );

    res.end(
        await client.register.metrics()
    );

});

module.exports = app;