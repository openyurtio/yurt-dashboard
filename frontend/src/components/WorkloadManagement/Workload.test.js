import React from "react";
import Workload from "./WorkloadTemplate";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../utils/jest.mock";

describe("Workload Test", () => {
  const testTitle = "WorkloadTest";

  it("should render normally with empty table data", () => {
    const mockAsyncFn = jest.fn(async () => {
      return Promise.resolve([]);
    });

    const { getByText } = render(
      <Workload title={testTitle} table={{ fetchData: mockAsyncFn }}></Workload>
    );

    expect(getByText(testTitle)).not.toBeNull();
    expect(mockAsyncFn.mock.calls.length).toBe(1);
  });

  // this may cause an `act` warning in testing (https://github.com/testing-library/react-testing-library/issues/281)
  // for now, just leave it alone
  it("should update the whole page when refresh button is called", async () => {
    const mockAsyncFn = jest.fn(async () => Promise.resolve([]));

    const { findByText, getByRole, findByPlaceholderText } = render(
      <Workload title={testTitle} table={{ fetchData: mockAsyncFn }}></Workload>
    );

    userEvent.type(
      await findByPlaceholderText("search title"),
      "search string"
    );
    userEvent.click(getByRole("button", { name: /refresh/i }));

    await waitFor(() => expect(mockAsyncFn).toHaveBeenCalledTimes(2));

    expect(await findByText("No Data")).not.toBeNull(); // no data returned from faked request API
    expect(await findByText(testTitle)).not.toBeNull(); // UI has been displayed properly
    expect((await findByPlaceholderText("search title")).value).toBe(""); // search string has been updated
  });
});
