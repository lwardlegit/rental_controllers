import { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import { Button, Modal } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router";
import "./Dashboard.css"; // <-- make sure you save your CSS as Dashboard.css

function HouseControls() {
    const [controllers, setControllers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ houseName: "" });
    const [session, setSession] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const stored = localStorage.getItem("session");
        const parsed = stored ? JSON.parse(stored) : null;

        if (!parsed || Object.keys(parsed).length === 0) {
            navigate("/login");
        } else {
            setSession(parsed);
        }
    }, [navigate]);



    if (!session) return null;

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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to save house");
            const newController = await res.json();

            setControllers((prev) => [...prev, ...newController.controllers]);
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
        <div className="site-wrap">
            {/* Sidebar */}
            <nav className="site-nav">
                <div className="name">
                    {session?.data?.user?.email || "User"}
                </div>

                <ul>
                    <li className="active">
                        <a href="#">Dashboard</a>
                    </li>
                    <li>
                        <a href="#" onClick={toggleModal}>
                            Add Controller
                        </a>
                    </li>
                    <li>
                        <a href="/logout">Logout</a>
                    </li>
                </ul>

                <div className="note">
                    <h3>Status</h3>
                    <p>{controllers.length} controllers connected</p>
                </div>
            </nav>

            {/* Main Dashboard */}
            <main>
                <header>
                    <h2>Trash Controller Dashboard</h2>
                </header>

                <section className="content-columns">
                    {controllers.length === 0 ? (
                        <div className="col">
                            <h5>No controllers yet</h5>
                            <p>Add one using the sidebar.</p>
                        </div>
                    ) : (
                        controllers.map((controller, index) => (
                            <div key={controller.id} className="col">
                                <h5>{controller.house_name}</h5>

                                <div className="item p-2 my-2">
                                    <p>Trash Reset</p>
                                    <Form.Check
                                        type="switch"
                                        id={`reset-${index}`}
                                        className="custom-switch"
                                        checked={controller.status === "on"}
                                        onChange={() => executeCommand(controller.id, "reset")}
                                    />
                                </div>

                                <div className="item p-2 my-2">
                                    <p>Trash Off</p>
                                    <Form.Check
                                        type="switch"
                                        id={`off-${index}`}
                                        className="custom-switch"
                                        checked={!controller.empty}
                                        onChange={() => executeCommand(controller.id, "off")}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </section>
            </main>

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
        </div>
    );
}

export default HouseControls;
