// __tests__/controllers.functional.test.js
const request = require("supertest");
const express = require("express");
const router = require("../server");
const supabase = require("../SupabaseClient");

jest.mock("../SupabaseClient");

const app = express();
app.use(express.json());
app.use("/", router);

describe("Trash Controllers routes (functional)", () => {
    afterEach(() => jest.clearAllMocks());

    test("POST /controllers/create should insert controller", async () => {
        supabase.from.mockReturnValue({
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue({
                data: [{ id: 1, house_name: "MyHouse", email: "test@example.com" }],
                error: null,
            }),
        });

        const res = await request(app)
            .post("/controllers/create")
            .send({ house_name: "MyHouse", email: "test@example.com" });

        expect(res.status).toBe(200);
        expect(res.body[0].house_name).toBe("MyHouse");
    });

    test("POST /controllers should return controllers for user", async () => {
        supabase.from.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({
                data: [{ id: 1, house_name: "Home", email: "me@test.com" }],
                error: null,
            }),
        });

        const res = await request(app)
            .post("/controllers")
            .send({ email: "me@test.com" });

        expect(res.status).toBe(200);
        expect(res.body.controllers[0].house_name).toBe("Home");
    });
});
