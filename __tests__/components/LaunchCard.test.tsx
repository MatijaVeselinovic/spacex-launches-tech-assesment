/* @jest-environment jsdom */

import { fireEvent, render, screen } from "@/tests/test-utils";
import LaunchCard from "@/components/LaunchCard";
import type { LaunchListItem } from "@/types/spacex";

const base: LaunchListItem = {
  id: "id-1",
  name: "Demo Mission",
  date_utc: "2020-01-01T00:00:00.000Z",
  success: true,
  rocket: null,
  launchpad: null,
  links: { patch: { small: null } },
};

describe("LaunchCard image/placeholder branch", () => {
  test("renders an <img> when links.patch.small exists", () => {
    const launch: LaunchListItem = {
      ...base,
      id: "id-img",
      links: { patch: { small: "https://example.com/patch.png" } },
    };

    const { container } = render(<LaunchCard launch={launch} />);

    // next/image is mocked to a plain <img /> in jest.setup
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    // sanity: should not render the gray placeholder div in this branch
    const placeholder = container.querySelector(
      "div.w-16.h-16.bg-gray-100.rounded",
    );
    expect(placeholder).not.toBeInTheDocument();
  });

  test("renders a gray placeholder when no patch image is available", () => {
    const launch: LaunchListItem = {
      ...base,
      id: "id-placeholder",
      links: { patch: { small: null } },
    };

    const { container } = render(<LaunchCard launch={launch} />);

    // Should NOT render <img> in the no-image branch
    const img = container.querySelector("img");
    expect(img).not.toBeInTheDocument();

    // The placeholder box
    const placeholder = container.querySelector(
      "div.w-16.h-16.bg-gray-100.rounded",
    );
    expect(placeholder).toBeInTheDocument();
  });

  test("renders launch card and toggles favorite", () => {
    const launch: LaunchListItem = {
      ...base,
      id: "id-placeholder",
      links: { patch: { small: null } },
    };
    localStorage.clear();
    render(<LaunchCard launch={launch} />);
    const star = screen.getByRole("button", { name: /add to favorites/i });
    expect(star).toHaveTextContent("☆");
    fireEvent.click(star);
    expect(star).toHaveTextContent("★");
  });
});
