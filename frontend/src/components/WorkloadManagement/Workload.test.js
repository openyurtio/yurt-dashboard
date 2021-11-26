import React from "react";
import Workload from "./WorkloadTemplate";
import { render } from "@testing-library/react";
import userEvent from '@testing-library/user-event'
import "../../utils/jest.mock";

describe("Workload Test", () => {

    const testTitle = "WorkloadTest"

    it("should render normally with empty table data", () => {
        const mockAsyncFn = jest.fn(async () => {
            return Promise.resolve([])
        })

        const { getByText } = render(<Workload title={testTitle} table={{ fetchData: mockAsyncFn }} ></ Workload >)

        expect(getByText(testTitle)).not.toBeNull();
        expect(mockAsyncFn.mock.calls.length).toBe(1);
    })

    it("should update the whole page when refresh button is called", () => {
        const mockAsyncFn = jest.fn(async () => {
            return Promise.resolve([])
        })

        const { getByText, getByRole, getByPlaceholderText } = render(<Workload title={testTitle} table={{ fetchData: mockAsyncFn }} ></ Workload >)
        userEvent.click(getByRole("button", { name: /refresh/i }));

        expect(getByText(testTitle)).not.toBeNull();
        expect(getByPlaceholderText("search title").value).toBe("");
        expect(mockAsyncFn.mock.calls.length).toBe(2);
    })

})