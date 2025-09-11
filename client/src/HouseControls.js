import { useState } from "react";
import Form from "react-bootstrap/Form";
import controllersData from "./controllers.json"; // adjust path

function HouseControls() {
    // Initialize state with JSON data
    const [houses, setHouses] = useState(Object.values(controllersData));

    const handleResetTrash = async (controllerId) => {
        try {
            const res = await fetch("http://localhost:5000/trash/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ controllerId }),
            });
            const data = await res.json();
            console.log("Server response:", data);
        } catch (err) {
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
                            <p>trash</p>
                            <Form.Check
                                type="switch"
                                id={`trash-${index}`}
                                className="custom-switch"
                                checked={house.status === "on"}
                                onChange={() => handleResetTrash(house.id)}
                            />
                        </div>

                        <div className="col-4">
                            <p>hot tub</p>
                            <Form.Check
                                type="switch"
                                id={`hottub-${index}`}
                                className="custom-switch"
                                checked={!house.empty}
                                onChange={() => handleResetTrash(house.id)}
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
