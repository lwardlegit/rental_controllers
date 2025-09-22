import { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import { Button, Modal } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

function HouseControls() {
    const [controllers, setControllers] = useState([]);   // ✅ use DB controllers only
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ houseName: "" });
    const [session, setSession] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        try {
            const stored = localStorage.getItem("session");
            if (stored) {
                const parsed = JSON.parse(stored);
                setSession(parsed);

                // Prefer controllers from navigation, fallback to session
                if (location.state?.controllers) {
                    setControllers(location.state.controllers);
                } else if (parsed.controllers) {
                    setControllers(parsed.controllers);
                }
            } else {
                navigate("/login"); // no session → send back to login
            }
        } catch (err) {
            console.error("Invalid session in storage:", err);
            navigate("/login");
        }
    }, [navigate, location.state]);

    if (!session) return null; // show nothing until session loads


    const toggleModal = () => setShowModal(!showModal);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                house_name: formData.houseName,
                email: session.data.user.email,
            };

            const res = await fetch("http://localhost:5000/api/controllers/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to save house");

            const newController = await res.json();

            // ✅ add new controller to state
            setControllers((prev) => [...prev, ...newController.controllers]);

            // clear form after successful submit
            setFormData({ houseName: "" });
            toggleModal();
        } catch (err) {
            console.error(err);
        }
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
        } catch (err) {
            console.error("Error sending command:", err);
            alert("Failed to send command — check server connection.");
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

            {/* Controllers list */}
            {controllers.map((controller, index) => (
                <div key={controller.id}>
                    <div className="row align-items-center text-center my-2">
                        <div className="col-4 text-start">{controller.house_name}</div>

                        <div className="col-4">
                            <p>trash reset</p>
                            <Form.Check
                                type="switch"
                                id={`reset-${index}`}
                                className="custom-switch"
                                checked={controller.status === "on"}
                                onChange={() => executeCommand(controller.id, "reset")}
                            />
                        </div>

                        <div className="col-4">
                            <p>trash off</p>
                            <Form.Check
                                type="switch"
                                id={`off-${index}`}
                                className="custom-switch"
                                checked={!controller.empty}
                                onChange={() => executeCommand(controller.id, "off")}
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
