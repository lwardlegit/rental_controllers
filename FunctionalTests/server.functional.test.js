const request = require("supertest");
const WebSocket = require("ws");
const path = require("path");
const fs = require("fs");

let server, app;

// clean up controllers.json before tests
const controllersFile = path.join(__dirname, "../controllers.json");

beforeAll(() => {
    try {
        fs.unlinkSync(controllersFile);
    } catch (_) {}

    const srvModule = require("../server"); // adjust path to your server.js
    server = srvModule.server;
    app = srvModule.app;
});

afterAll((done) => {
    server.close(done);
});

describe("Functional tests (HTTP + WebSocket)", () => {
    it("should return empty controllers list initially", async () => {
        const res = await request(app).get("/trash/controllers");
        expect(res.status).toBe(200);
        expect(res.body).toEqual({});
    });

    it("should register a controller over WebSocket and then appear in GET /trash/controllers", (done) => {
        const wsClient = new WebSocket("ws://localhost:5000");

        wsClient.on("open", () => {
            wsClient.send(JSON.stringify({ type: "register", id: "ctrl-fn-1" }));
        });

        wsClient.on("message", async (msg) => {
            const data = JSON.parse(msg.toString());
            expect(data.status).toBe("registered");
            expect(data.id).toBe("ctrl-fn-1");

            // Now check REST endpoint reflects this
            const res = await request(app).get("/trash/controllers");
            expect(res.body).toHaveProperty("ctrl-fn-1");
            expect(res.body["ctrl-fn-1"].status).toBe("on");

            wsClient.close();
            done();
        });
    });

    it("should mark controller empty=false after event and persist to file", (done) => {
        const wsClient = new WebSocket("ws://localhost:5000");

        wsClient.on("open", () => {
            wsClient.send(JSON.stringify({ type: "register", id: "ctrl-fn-2" }));
            setTimeout(() => {
                wsClient.send(JSON.stringify({ type: "event", id: "ctrl-fn-2", message: "trash detected" }));
            }, 50);
        });

        wsClient.on("message", () => {
            setTimeout(async () => {
                const res = await request(app).get("/trash/controllers");
                expect(res.body["ctrl-fn-2"].empty).toBe(false);

                // confirm persistence by checking file written
                const fileData = JSON.parse(fs.readFileSync(controllersFile, "utf-8"));
                expect(fileData["ctrl-fn-2"].empty).toBe(false);

                wsClient.close();
                done();
            }, 100);
        });
    });

    it("should fail reset if controller is not connected", async () => {
        const res = await request(app).post("/trash/reset").send({ controllerId: "fake123" });
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    // we need a connected controller to respond back before resetting to run this test
    it("should send reset command to a connected controller", (done) => {
        const wsClient = new WebSocket("ws://localhost:5000");

        wsClient.on("open", () => {
            // Step 1: Register controller
            wsClient.send(JSON.stringify({ type: "register", id: "ctrl-fn-3" }));
        });

        wsClient.on("message", async (msg) => {
            const data = JSON.parse(msg.toString());

            if (data.status === "registered") {
                // Step 2: Call reset API
                const res = await request(app)
                    .post("/trash/reset")
                    .send({ controllerId: "ctrl-fn-3" });

                expect(res.status).toBe(200);
                expect(res.body.success).toBe(true);
                expect(res.body.message).toMatch(/ctrl-fn-3/);
            } else if (data.command === "reset") {
                // Step 3: Controller receives reset command
                expect(data.command).toBe("reset");

                wsClient.close();
                done();
            }
        });
    });

});
