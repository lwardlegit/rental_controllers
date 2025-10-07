import * as router from "react-router";

// for now keeping this test in case react changes something about react-router imports in the future
test("react-router-dom loads", () => {
    expect(router).toBeDefined();
});