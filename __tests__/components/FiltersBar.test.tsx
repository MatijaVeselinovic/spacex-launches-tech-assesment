/* @jest-environment jsdom */

import { render, screen, fireEvent, act, waitFor } from "@/tests/test-utils";
import userEvent from "@testing-library/user-event";
import FiltersBar from "@/components/FiltersBar";

// file-local mock
const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({ push: pushMock }),
  usePathname: () => "/launches",
}));

const baseInitial = {
  status: "all" as const,
  success: "all" as const,
  sort: "date_desc" as const,
  search: "",
  from: undefined as string | undefined,
  to: undefined as string | undefined,
};

const parseUrl = (href: string) => new URL(href, "http://example.test");

describe("FiltersBar (with data-testid)", () => {
  beforeEach(() => pushMock.mockReset());

  test("renders defaults from initial state", () => {
    render(<FiltersBar initial={baseInitial} />);
    expect(screen.getByTestId(/status/i)).toHaveValue("all");
    expect(screen.getByTestId(/outcome/i)).toHaveValue("all");
    expect(screen.getByTestId(/sort/i)).toHaveValue("date_desc");
    expect(screen.getByTestId(/mission-name/i)).toHaveValue("");
    expect(screen.getByTestId(/^from$/i)).toHaveValue("");
    expect(screen.getByTestId(/^to$/i)).toHaveValue("");
  });

  test("applies non-default filters and calls router.push with the correct query", async () => {
    const user = userEvent.setup();
    render(<FiltersBar initial={baseInitial} />);

    const status = screen.getByTestId(/status/i) as HTMLSelectElement;
    const outcome = screen.getByTestId(/outcome/i) as HTMLSelectElement;
    const sort = screen.getByTestId(/sort/i) as HTMLSelectElement;
    const mission = screen.getByTestId(/mission-name/i) as HTMLInputElement;
    const from = screen.getByTestId(/^from$/i) as HTMLInputElement;
    const to = screen.getByTestId(/^to$/i) as HTMLInputElement;

    await act(async () => {
      await user.selectOptions(status, "upcoming");
      await user.selectOptions(outcome, "success");
      await user.selectOptions(sort, "name_asc");
      await user.clear(mission);
      await user.type(mission, "starlink");
      fireEvent.change(from, { target: { value: "2020-01-01" } });
      fireEvent.change(to, { target: { value: "2020-12-31" } });
      await user.click(screen.getByRole("button", { name: /apply filters/i }));
    });

    await waitFor(() => expect(pushMock).toHaveBeenCalledTimes(1));
    const url = parseUrl(pushMock.mock.calls[0][0] as string);
    const q = url.searchParams;
    expect(url.pathname).toBe("/launches");
    expect(q.get("status")).toBe("upcoming");
    expect(q.get("success")).toBe("success");
    expect(q.get("sort")).toBe("name_asc");
    expect(q.get("search")).toBe("starlink");
    expect(q.get("from")).toBe("2020-01-01");
    expect(q.get("to")).toBe("2020-12-31");
  });

  test("includes only changed params (excludes defaults)", async () => {
    const user = userEvent.setup();
    render(<FiltersBar initial={baseInitial} />);

    await act(async () => {
      await user.type(screen.getByTestId(/mission-name/i), "falcon");
      await user.click(screen.getByRole("button", { name: /apply filters/i }));
    });

    await waitFor(() => expect(pushMock).toHaveBeenCalledTimes(1));
    const url = parseUrl(pushMock.mock.calls[0][0] as string);
    expect(Array.from(url.searchParams.keys())).toEqual(["search"]);
    expect(url.searchParams.get("search")).toBe("falcon");
  });

  test("reset restores defaults and routes to bare pathname", async () => {
    const user = userEvent.setup();
    render(
      <FiltersBar
        initial={{
          status: "past",
          success: "failure",
          sort: "name_desc",
          search: "foo",
          from: "2021-01-01",
          to: "2021-02-01",
        }}
      />,
    );

    await act(async () => {
      await user.click(screen.getByRole("button", { name: /reset/i }));
    });

    expect(screen.getByTestId(/status/i)).toHaveValue("all");
    expect(screen.getByTestId(/outcome/i)).toHaveValue("all");
    expect(screen.getByTestId(/sort/i)).toHaveValue("date_desc");
    expect(screen.getByTestId(/mission-name/i)).toHaveValue("");
    expect(screen.getByTestId(/^from$/i)).toHaveValue("");
    expect(screen.getByTestId(/^to$/i)).toHaveValue("");

    await waitFor(() => expect(pushMock).toHaveBeenCalledTimes(1));
    const url = parseUrl(pushMock.mock.calls[0][0] as string);
    expect(url.pathname).toBe("/launches");
    expect(url.search).toBe("");
  });

  test("clearing date inputs removes those params from the query", async () => {
    const user = userEvent.setup();
    render(
      <FiltersBar
        initial={{ ...baseInitial, from: "2020-01-01", to: "2020-02-01" }}
      />,
    );

    const from = screen.getByTestId(/^from$/i) as HTMLInputElement;
    const to = screen.getByTestId(/^to$/i) as HTMLInputElement;

    await act(async () => {
      fireEvent.change(from, { target: { value: "" } });
      fireEvent.change(to, { target: { value: "" } });
      await user.click(screen.getByRole("button", { name: /apply filters/i }));
    });

    await waitFor(() => expect(pushMock).toHaveBeenCalledTimes(1));
    const url = parseUrl(pushMock.mock.calls[0][0] as string);
    const q = url.searchParams;
    expect(q.get("from")).toBeNull();
    expect(q.get("to")).toBeNull();
  });
});
