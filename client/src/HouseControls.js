import {useEffect, useState} from "react";
import Form from "react-bootstrap/Form";
import controllersData from "./controllers.json";
import {Button, Modal} from "react-bootstrap";
import {useNavigate} from "react-router-dom"; // adjust path

function HouseControls() {
    // Initialize state with JSON data
    const [houses, setHouses] = useState(Object.values(controllersData));
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ id: "", houseName: "" });
    const [session, setSession] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const stored = localStorage.getItem("session");
            if (stored) {
                setSession(JSON.parse(stored));
            } else {
                navigate("/login"); // no session → send back to login
            }
        } catch (err) {
            console.error("Invalid session in storage:", err);
            navigate("/login");
        }
    }, [navigate]);

    if (!session) return null; // or a loading spinner


    const toggleModal = () => setShowModal(!showModal);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const newHouse = { ...formData, status: "off", empty: true };
        setHouses((prev) => [...prev, newHouse]);
        setFormData({ id: "", houseName: "" });
        toggleModal();
    };
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
            <div>
                <Button onClick={toggleModal}>Add Controller</Button>
            </div>

            {/* Modal */}
            <Modal show={showModal} onHide={toggleModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add Controller</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleFormSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Controller ID</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="id"
                                name="id"
                                value={formData.id}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>House Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="house name"
                                name="houseName"
                                value={formData.houseName}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit">
                            Save
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Houses list */}

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
