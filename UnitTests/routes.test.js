jest.mock("../SupabaseClient", () => {
    const mockSignUp = jest.fn().mockResolvedValue({
        data: { user: { username: "tester", email: "test@example.com" } },
        error: null,
    });

    const mockLogin = jest.fn().mockResolvedValue({
        data: {
            user: { username: "tester", email: "test@example.com" },
            session: { access_token: "test_token" },
        },
        error: null,
    });

    const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
            data: [{ id: 1, username: "tester", email: "test@example.com" }],
            error: null,
        }),
    });

    const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
    });

    return {
        getSupabase: jest.fn().mockResolvedValue({
            auth: { signUp: mockSignUp, signInWithPassword: mockLogin },
            from: jest.fn(() => ({
                select: mockSelect,
                delete: mockDelete,
            })),
        }),
    };
});


const request = require("supertest");
const express = require("express");
const router = require("../routes");

describe("Users routes (unit)", () => {
    let app;
    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use(router);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("POST /users should create a user", async () => {
        const res = await request(app)
            .post("/users")
            .send({ username: "tester", email: "test@example.com", password: "pass123" });

        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe("test@example.com");

        const { getSupabase } = require("../SupabaseClient");
        const supabase = await getSupabase();
        expect(supabase.auth.signUp).toHaveBeenCalled();
    });

    test("POST /users/login should return logged in user", async () => {
        const res = await request(app)
            .post("/users/login")
            .send({email: "test@example.com", password: "pass123" })

        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe("test@example.com");
        expect(res.body.session.access_token).toBe("test_token")
        expect(res.body.session.profile).not.toBe(null);
    });

    test("DELETE /profile/delete should delete user profile", async () => {
        const res = await request(app)
            .post("/profile/delete")
            .send({email:"test@example.com"})

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("user profile deleted");
    });
});
