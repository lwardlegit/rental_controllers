const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const fs = require("fs");
const cors = require("cors");


// need to make arduino command work for OFF

// Middleware to parse JSON
app.use(express.json());

app.use(cors({ origin: "http://localhost:3000" }));

// Serve React build (later when you add UI)
app.use(express.static(path.join(__dirname, "client/build")));

let controllers = {};
const controllersFile = path.join(__dirname, "controllers.json");

// Load controllers from JSON file (if it exists)
function loadControllers() {
    if (fs.existsSync(controllersFile)) {
        try {
            return JSON.parse(fs.readFileSync(controllersFile, "utf-8"));
        } catch (err) {
            console.error("Error reading controllers file:", err);
        }
    }
    return {};
}
    // Save controllers to JSON file
function saveControllers(data) {
        fs.writeFileSync(controllersFile, JSON.stringify(data, null, 2));
    }

    // Initialize controllers data
    let controllersData = loadControllers();

    // Middleware
    app.use(express.json());
    app.use(express.static(path.join(__dirname, "client/build")));

    // API: Get all controllers
    app.get("/trash/controllers", (req, res) => {
       try {
           res.json(controllersData);
       }catch (e) {
           res.json("Error getting controllers");
       }
    });


// API: Send reset command to a controller
app.post("/trash/reset", (req, res) => {
    const { controllerId } = req.body;   // ✅ match React body
    const ws = controllers[controllerId];
    console.log(req.body);

    if (ws && ws.readyState === WebSocket.OPEN) {
       // ws.send(JSON.stringify({ command: "reset" }));
        resetControllerById(ws)
        res.json({ success: true, message: `Reset command sent to ${controllerId}` });
    } else {
        res.status(404).json({ success: false, message: "Controller not connected" });
    }
});


 app.get("/*", (req, res) => {
   res.sendFile(path.join(__dirname, "client/build", "index.html"));
 });


// WebSocket handling
wss.on("connection", ws => {
    console.log("Controller connected, waiting for registration...");

    ws.on("message", message => {
        try {
            const data = JSON.parse(message);

            if (data.type === "register" && data.id) {
                controllers[data.id] = ws;

                // Create entry if not exists
                if (!controllersData[data.id]) {
                    controllersData[data.id] = {
                        id: data.id,
                        status: "on",   // default when registered
                        empty: true     // assume empty at registration
                    };
                } else {
                    controllersData[data.id].status = "on";
                }

                saveControllers(controllersData);

                console.log(`Controller registered: ${data.id}`);
                ws.send(JSON.stringify({ status: "registered", id: data.id }));
            }

            if (data.type === "event") {
                console.log(`Event from ${data.id}: ${data.message}`);
                if (controllersData[data.id]) {
                    // If trash alert received, set empty = false
                    controllersData[data.id].empty = false;
                    saveControllers(controllersData);
                }
            }
        } catch (err) {
            console.error("Invalid message:", message);
        }
    });

    ws.on("close", () => {
        for (let id in controllers) {
            if (controllers[id] === ws) {
                console.log(`Controller disconnected: ${id}`);
                controllersData[id].status = "off";
                saveControllers(controllersData);
                delete controllers[id];
            }
        }
    });
});

// Start server
const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };

