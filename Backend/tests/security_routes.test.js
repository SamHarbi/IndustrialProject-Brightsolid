const request = require("supertest");
const app = require("../index.js");

/*
    Test that all secure routes are not accessible without login
*/

describe("Test compliantrules path with a GET", () => {
    test("Should respond with 500 / Unauthorized", done => {
        request(app).get("/compliantrules").then(response => {
            expect(response.statusCode).toBe(500);
            done();
        });
    });
});

describe("Test noncompliantrules path with a GET", () => {
    test("Should respond with 500 / Unauthorized", done => {
        request(app).get("/noncompliantrules").then(response => {
            expect(response.statusCode).toBe(500);
            done();
        });
    });
});

describe("Test noncompliantrules path with a GET", () => {
    test("Should respond with 500 / Unauthorized", done => {
        request(app).get("/user").then(response => {
            expect(response.statusCode).toBe(500);
            done();
        });
    });
});

describe("Test noncompliantrules path with a GET", () => {
    test("Should respond with 500 / Unauthorized", done => {
        request(app).get("/summary").then(response => {
            expect(response.statusCode).toBe(500);
            done();
        });
    });
});