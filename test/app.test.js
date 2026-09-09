const request = require("supertest");
const app = require("../app");

describe("Node.js application", () => {

    test("GET / returns 200", async () => {

        const response = await request(app).get("/");

        expect(response.statusCode).toBe(200);

        expect(response.body.message).toBe(
            "Hello from Node.js CI/CD!"
        );
    });

    test("GET /health returns UP", async () => {

        const response = await request(app).get("/health");

        expect(response.statusCode).toBe(200);

        expect(response.body.status).toBe("UP");
    });

});