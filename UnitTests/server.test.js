const request = require("supertest");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

// Import server
let server;
let app;

beforeAll(() => {
    jest.spyOn(fs, "writeFileSync").mockImplementation(() => {}); // prevent real file writes
    jest.spyOn(fs, "existsSync").mockReturnValue(false); // pretend no file at startup
    jest.spyOn(fs, "readFileSync").mockImplementation(() => "{}");

    // Import after mocks
    const srvModule = require("../server");
    server = srvModule.server;
    app = srvModule.app;
});

afterAll((done) => {
    server.close(done);
});

describe("REST API", () => {
    it("GET /trash/controllers should return controllers object", async () => {
        const res = await request(app).get("/trash/controllers");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({});
    });

    it("POST /trash/reset with unknown controller should return 404", async () => {
        const res = await request(app)
            .post("/trash/reset")
            .send({ controllerId: "abc123" });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
    });
});

describe("WebSocket handling", () => {
    let wsClient;

    beforeEach((done) => {
        wsClient = new WebSocket("ws://localhost:5000");
        wsClient.on("open", () => done());
    });

    afterEach(() => {
        if (wsClient.readyState === WebSocket.OPEN) {
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
            wsClient.send(JSON.stringify({ type: "event", id: "ctrl2", message: "trash detected" }));
        }, 50);

        // Listen to logs
        setTimeout(() => {
            const controllersFile = path.join(__dirname, "controllers.json");
            expect(fs.writeFileSync).toHaveBeenCalled();
            done();
        }, 100);
    });
});
