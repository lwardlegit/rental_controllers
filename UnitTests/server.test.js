const request = require("supertest");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

let server;
let app;
let controllers;

beforeAll(() => {
    // Prevent real filesystem interactions
    jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
    jest.spyOn(fs, "existsSync").mockReturnValue(false);
    jest.spyOn(fs, "readFileSync").mockImplementation(() => "{}");

    // Import server AFTER mocks
    const srvModule = require("../server");
    server = srvModule.server;
    app = srvModule.app;
    controllers = srvModule.controllers;
});

afterAll((done) => {
    if (server && server.close) {
        server.close(done);
    } else {
        done();
    }
});

describe("REST API", () => {
    it("GET /trash/controllers should return controllers object", async () => {
        const res = await request(app).get("/trash/controllers");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({});
    });

    it("POST /trash/command with unknown controller should return 404", async () => {
        const res = await request(app)
            .post("/trash/command")
            .send({ controllerId: "abc123", command: "reset" });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it("POST /trash/command with known controller for 'reset' command happy path", async () => {
        const fakeWs = {
            readyState: WebSocket.OPEN,
            send: jest.fn(),
        };

        controllers["ctrl1"] = fakeWs;

        const res = await request(app)
            .post("/trash/command")
            .send({ controllerId: "ctrl1", command: "reset" });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Reset command sent to ctrl1");
        expect(res.body.success).toBe(true);
        expect(fakeWs.send).toHaveBeenCalledWith(
            JSON.stringify({ command: "reset" })
        );
    });

    it("POST /trash/command with known controller for 'off' command happy path", async () => {
        const fakeWs = {
            readyState: WebSocket.OPEN,
            send: jest.fn(),
        };

        controllers["ctrl1"] = fakeWs;

        const res = await request(app)
            .post("/trash/command")
            .send({ controllerId: "ctrl1", command: "off" }); // ✅ FIXED

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Off command sent to ctrl1");
        expect(res.body.success).toBe(true);
        expect(fakeWs.send).toHaveBeenCalledWith(
            JSON.stringify({ command: "off" })
        );
    });
});

describe("WebSocket handling", () => {
    let wsClient;

    beforeEach((done) => {
        wsClient = new WebSocket("ws://localhost:5000");
        wsClient.on("open", () => done());
    });

    afterEach(() => {
        if (wsClient && wsClient.readyState === WebSocket.OPEN) {
            wsClient.close();
        }
    });

    it("should register controller on register message", (done) => {
        wsClient.on("message", (msg) => {
            const data = JSON.parse(msg.toString());
            expect(data.status).toBe("registered");
            expect(data.id).toBe("ctrl1");
            done();
        });

        wsClient.send(JSON.stringify({ type: "register", id: "ctrl1" }));
    });

    it("should update controller empty=false on event message", (done) => {
        // Step 1: Register
        wsClient.send(JSON.stringify({ type: "register", id: "ctrl2" }));

        // Step 2: Send event
        setTimeout(() => {
            wsClient.send(
                JSON.stringify({
                    type: "event",
                    id: "ctrl2",
                    message: "trash detected",
                })
            );
        }, 50);

        // Step 3: Verify fs.writeFileSync was called
        setTimeout(() => {
            expect(fs.writeFileSync).toHaveBeenCalled();
            done();
        }, 100);
    });
});
