const request = require("supertest");
const app = require("../index.js");

/*
    Test that all secure routes are not accessible without login
*/

describe("Test compliantrules path with a GET", () => {
    test("Should respond with 500 / Unauthorized", done => {
        request(app).get("/compliantresources").then(response => {
            expect(response.statusCode).toBe(500);
            done();
        });
    });
});

describe("Test noncompliantrules path with a GET", () => {
    test("Should respond with 500 / Unauthorized", done => {
        request(app).get("/noncompliantresources").then(response => {
            expect(response.statusCode).toBe(500);
            done();
        });
    });
});

describe("Test user path with a GET", () => {
    test("Should respond with 500 / Unauthorized", done => {
        request(app).get("/user").then(response => {
            expect(response.statusCode).toBe(500);
            done();
        });
    });
});

describe("Test summary path with a GET", () => {
    test("Should respond with 500 / Unauthorized", done => {
        request(app).get("/summary").then(response => {
            expect(response.statusCode).toBe(500);
            done();
        });
    });
});

describe("Test detailreport path with a GET", () => {
    test("Should respond with 500 / Unauthorized", done => {
        request(app).get("/detailreport").then(response => {
            expect(response.statusCode).toBe(500);
            done();
        });
    });
});

