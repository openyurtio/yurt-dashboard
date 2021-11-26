import React from "react";
import { BrowserRouter } from "react-router-dom";
import { render, fireEvent } from "@testing-library/react";
import LoginForm from "./LoginForm";
import "../../utils/jest.mock"

describe("Login Form Test", () => {
    it("should prevent blank input login", async () => {
        const { getByTestId, findByRole } = render(<BrowserRouter><LoginForm /></BrowserRouter>
        );

        fireEvent.click(getByTestId("login"));

        expect(await findByRole("alert")).not.toBeNull();
    })

    it("should prevent non-standard input", async () => {
        const { findByRole, getByPlaceholderText } = render(<BrowserRouter><LoginForm /></BrowserRouter>)
        const phoneNumberInput = getByPlaceholderText("Phone Number");

        fireEvent.change(phoneNumberInput, { target: { value: "12345" } });

        expect(await findByRole("alert")).not.toBeNull();
    })

    it("should receive login initial props", () => {
        const initState = {
            spec: {
                mobilephone: "11111",
                token: "avx"
            }
        }
        const { getByLabelText } = render(<BrowserRouter><LoginForm initState={initState} /></BrowserRouter>);

        expect(getByLabelText("phonenumber-input").value).toBe(initState.spec.mobilephone);
        expect(getByLabelText("password-input").value).toBe(initState.spec.token);
    })

})