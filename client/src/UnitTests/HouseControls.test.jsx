import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HouseControls from "../HouseControls";
import { MemoryRouter, useNavigate } from "react-router";
import { Button, Modal } from "react-bootstrap";

// Mock bootstrap components
jest.mock("react-bootstrap", () => {
    const Form = ({ children, ...props }) => <form {...props}>{children}</form>;
    Form.Group = ({ children }) => <div>{children}</div>;
    Form.Label = ({ children }) => <label>{children}</label>;
    Form.Control = ({ ...props }) => <input {...props} />;
    Form.Check = ({ ...props }) => <input type="checkbox" {...props} />;

    const Modal = ({ children }) => <div data-testid="modal">{children}</div>;
    Modal.Header = ({ children }) => <div>{children}</div>;
    Modal.Body = ({ children }) => <div>{children}</div>;
    Modal.Title = ({ children }) => <h5>{children}</h5>;


    const Button = ({ children, onClick }) => (
        <button onClick={onClick}>{children}</button>
    );
    return {
        __esModule: true,
        Form,
        Button,
        Modal,
    };
});

jest.mock("react-router", () => {
    const actual = jest.requireActual("react-router");
    return {
        ...actual,
        useNavigate: jest.fn(),
        useLocation: () => ({ state: { controllers: [] } })
    };
});

// Mock fetch
global.fetch = jest.fn();

describe("HouseControls Component", () => {
    const mockNavigate = jest.fn();
    const session = {
        user: {email: "test@example.com"},
            controllers: [
                {id: 1, house_name: "Home A", status: "off", empty: false},
            ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();

        useNavigate.mockReturnValue(mockNavigate);
    });

    test("redirects to login if no session in localStorage", () => {
        localStorage.setItem("session", JSON.stringify({}));
        render(
            <MemoryRouter>
                <HouseControls />
            </MemoryRouter>
        );
        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    test("loads controllers from session", () => {
        localStorage.setItem("session", JSON.stringify(session));
        render(
            <MemoryRouter>
                <HouseControls />
            </MemoryRouter>
        );
        expect(screen.getByText("Home A")).toBeInTheDocument();
    });

    test("shows modal when 'Add Controller' button clicked", () => {
        localStorage.setItem("session", JSON.stringify(session));
        render(
            <MemoryRouter>
                <HouseControls />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("Add New Controller"));
        expect(screen.getByTestId("modal")).toBeInTheDocument();
        expect(screen.getByText("Add Controller")).toBeInTheDocument();
    });

    test("submits new controller and updates state", async () => {
        localStorage.setItem("session", JSON.stringify(session));
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ([{ id: 2, house_name: "New Home", status: "off", empty: true }]),
        });

        render(
            <MemoryRouter>
                <HouseControls />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("Add Controller"));
        fireEvent.change(screen.getByPlaceholderText("house name"), {
            target: { value: "New Home", name: "houseName" },
        });
        fireEvent.click(screen.getByText("Save"));

        await waitFor(() => {
            expect(screen.getByText("New Home")).toBeInTheDocument();
        });
    });

    test("handles failed form submit gracefully", async () => {
        localStorage.setItem("session", JSON.stringify(session));
        fetch.mockResolvedValueOnce({ ok: false });

        render(
            <MemoryRouter>
                <HouseControls />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("Add Controller"));
        fireEvent.change(screen.getByPlaceholderText("house name"), {
            target: { value: "Fail Home", name: "houseName" },
        });
        fireEvent.click(screen.getByText("Save"));

        await waitFor(() => {
            // stays in modal since fetch fails
            expect(screen.getByPlaceholderText("house name")).toHaveValue("Fail Home");
        });
    });
});
