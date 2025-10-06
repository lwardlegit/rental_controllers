import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HouseControls from "../HouseControls";
import { MemoryRouter, useNavigate } from "react-router";

// Mock bootstrap components
jest.mock("react-bootstrap", () => {
    const Form = ({ children, ...props }) => <form {...props}>{children}</form>;
    Form.Group = ({ children }) => <div>{children}</div>;
    Form.Label = ({ children }) => <label>{children}</label>;
    Form.Control = ({ ...props }) => <input {...props} />;
    Form.Check = ({ ...props }) => <input type="checkbox" {...props} />;
    return {
        __esModule: true,
        default: {},
        Form,
        Button: ({ children, ...props }) => <button {...props}>{children}</button>,
        Modal: ({ show, onHide, children }) =>
            show ? <div data-testid="modal">{children}</div> : null,
        "Modal.Header": ({ children }) => <div>{children}</div>,
        "Modal.Title": ({ children }) => <h2>{children}</h2>,
        "Modal.Body": ({ children }) => <div>{children}</div>,
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

        fireEvent.click(screen.getByText("Add Controller"));
        expect(screen.getByTestId("modal")).toBeInTheDocument();
        expect(screen.getByText("Add Controller")).toBeInTheDocument();
    });

    test("submits new controller and updates state", async () => {
        localStorage.setItem("session", JSON.stringify(session));
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                controllers: [{ id: 2, house_name: "New Home", status: "off", empty: true }],
            }),
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

    test("sends command when toggling controller switches", async () => {
        localStorage.setItem("session", JSON.stringify(session));
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true }),
        });

        render(
            <MemoryRouter>
                <HouseControls />
            </MemoryRouter>
        );

        const toggle = screen.getByRole("checkbox", { name: "" });
        fireEvent.click(toggle);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                "http://localhost:5000/trash/command",
                expect.objectContaining({
                    method: "POST",
                })
            );
        });
    });
});
