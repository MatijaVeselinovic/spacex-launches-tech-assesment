// __tests__/context/FavoritesContext.test.tsx
/* @jest-environment jsdom */

import React from "react";
import { render, screen, act, waitFor } from "@/tests/test-utils";
import userEvent from "@testing-library/user-event";
import {
  useFavoritesContext,
  FavoritesProvider,
} from "@/context/FavoritesContext";

const KEY = "spx:favorites";

/** Demo components used in tests */
const DemoToggle: React.FC<{ id: string }> = ({ id }) => {
  const { has, toggle } = useFavoritesContext();
  return (
    <button data-testid="toggle" onClick={() => toggle(id)}>
      {has(id) ? "★" : "☆"}
    </button>
  );
};

const DemoAR: React.FC<{ id: string }> = ({ id }) => {
  const { add, remove, has } = useFavoritesContext();
  return (
    <div>
      <button data-testid="add" onClick={() => add(id)}>
        add
      </button>
      <button data-testid="remove" onClick={() => remove(id)}>
        remove
      </button>
      <output data-testid="state">{has(id) ? "yes" : "no"}</output>
    </div>
  );
};

const DemoShow: React.FC<{ id: string }> = ({ id }) => {
  const { has } = useFavoritesContext();
  return <span data-testid="show">{has(id) ? "★" : "☆"}</span>;
};

/** Utility: mock visibilityState (read-only in JSDOM) */
function setVisibility(value: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => value,
  });
}

describe("FavoritesContext", () => {
  beforeEach(() => {
    localStorage.clear();
    setVisibility("visible");
  });

  test("toggles favorites and persists (add then remove path) without act warnings", async () => {
    const user = userEvent.setup();
    render(
      <FavoritesProvider>
        <DemoToggle id="X" />
      </FavoritesProvider>,
    );

    const btn = await screen.findByTestId("toggle");

    // toggle add
    await act(async () => {
      await user.click(btn);
    });
    expect(btn).toHaveTextContent("★");
    const raw1 = localStorage.getItem(KEY)!;
    expect(raw1).toContain("X");

    // toggle remove (covers the "has -> delete" branch in toggle)
    await act(async () => {
      await user.click(btn);
    });
    expect(btn).toHaveTextContent("☆");
    const raw2 = localStorage.getItem(KEY)!;
    expect(JSON.parse(raw2)).toEqual([]); // removed
  });

  test("add is idempotent and remove is a no-op when id absent (no act warnings)", async () => {
    const user = userEvent.setup();
    render(
      <FavoritesProvider>
        <DemoAR id="A" />
      </FavoritesProvider>,
    );

    const add = screen.getByTestId("add");
    const remove = screen.getByTestId("remove");
    const out = screen.getByTestId("state");

    // add once
    await act(async () => {
      await user.click(add);
    });
    expect(out).toHaveTextContent("yes");
    let list = JSON.parse(localStorage.getItem(KEY) || "[]");
    expect(list).toEqual(["A"]);

    // add again (prev.has(id) -> return prev branch)
    await act(async () => {
      await user.click(add);
    });
    list = JSON.parse(localStorage.getItem(KEY) || "[]");
    expect(list).toEqual(["A"]); // unchanged

    // remove once
    await act(async () => {
      await user.click(remove);
    });
    expect(out).toHaveTextContent("no");
    list = JSON.parse(localStorage.getItem(KEY) || "[]");
    expect(list).toEqual([]);

    // remove again (if !prev.has(id) -> return prev branch)
    await act(async () => {
      await user.click(remove);
    });
    list = JSON.parse(localStorage.getItem(KEY) || "[]");
    expect(list).toEqual([]); // still unchanged
  });

  test("reads existing favorites from localStorage after mount and does not overwrite them", async () => {
    // simulate existing favorites
    localStorage.setItem(KEY, JSON.stringify(["Z"]));

    render(
      <FavoritesProvider>
        <DemoShow id="Z" />
      </FavoritesProvider>,
    );

    const label = screen.getByTestId("show");

    // After the first effect it should reflect storage.
    await waitFor(() => expect(label).toHaveTextContent("★"));

    // ensure initial effect did not overwrite storage with "[]"
    const raw = localStorage.getItem(KEY)!;
    expect(raw).toContain("Z");
  });

  test('syncs when a "storage" event arrives from another tab', async () => {
    render(
      <FavoritesProvider>
        <DemoShow id="S" />
      </FavoritesProvider>,
    );

    const label = screen.getByTestId("show");
    expect(label).toHaveTextContent("☆");

    // Pretend another tab saved ["S"]
    localStorage.setItem(KEY, JSON.stringify(["S"]));

    await act(async () => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: KEY,
          newValue: JSON.stringify(["S"]),
        }),
      );
    });

    await waitFor(() => expect(label).toHaveTextContent("★"));
  });

  test("syncs when the tab becomes visible (visibilitychange)", async () => {
    render(
      <FavoritesProvider>
        <DemoShow id="V" />
      </FavoritesProvider>,
    );

    const label = screen.getByTestId("show");
    expect(label).toHaveTextContent("☆");

    // simulate background update, then focus/visible
    localStorage.setItem(KEY, JSON.stringify(["V"]));

    await act(async () => {
      setVisibility("visible");
      document.dispatchEvent(new Event("visibilitychange"));
    });

    await waitFor(() => expect(label).toHaveTextContent("★"));
  });

  test("ignores malformed localStorage content (readFromStorage fallback)", async () => {
    localStorage.setItem(KEY, JSON.stringify({ not: "an array" }));

    render(
      <FavoritesProvider>
        <DemoShow id="M" />
      </FavoritesProvider>,
    );

    const label = screen.getByTestId("show");
    await waitFor(() => expect(label).toHaveTextContent("☆"));
  });
});
