import { useState } from "react";
import Form from "react-bootstrap/Form";
import controllersData from "./controllers.json"; // adjust path

function HouseControls() {
    // Initialize state with JSON data
    const [houses, setHouses] = useState(Object.values(controllersData));

    const executeCommand = async (controllerId, command) => {

        try {
            const res = await fetch("http://localhost:5000/trash/command", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ controllerId, command }),
            });
            const data = await res.json();
            console.log("Server response:", data);
        }
        catch (err) {
            console.error("Error sending reset command:", err);
            alert("Failed to reset controller — check server connection.");
        }
    };


    return (
        <>
            {houses.map((house, index) => (
                <div key={house.id}>
                    <div className="row align-items-center text-center my-2">
                        <div className="col-4 text-start">{house.houseName}</div>

                        <div className="col-4">
                            <p>trash reset</p>
                            <Form.Check
                                type="switch"
                                id={`reset-${index}`}
                                className="custom-switch"
                                checked={house.status === "on"}
                                onChange={() => executeCommand(house.id, "reset")}
                            />
                        </div>

                        <div className="col-4">
                            <p>trash off</p>
                            <Form.Check
                                type="switch"
                                id={`off-${index}`}
                                className="custom-switch"
                                checked={!house.empty}
                                onChange={() => executeCommand(house.id, "off")}
                            />
                        </div>
                    </div>
                    <hr style={{ border: "2px solid black" }} />
                </div>
            ))}
        </>
    );
}

export default HouseControls;
