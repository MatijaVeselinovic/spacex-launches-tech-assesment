import { render, screen } from "@/tests/test-utils";
import { Badge } from "@/components/Badge";

describe("Badge palettes", () => {
  test("renders default (gray) palette when no color is provided", () => {
    render(<Badge>Default</Badge>);
    const el = screen.getByText("Default");
    // shared base classes
    expect(el).toHaveClass("border", "text-xs", "px-2", "py-1", "rounded-full");
    // default palette classes
    expect(el).toHaveClass("bg-gray-100", "text-gray-800", "border-gray-200");
  });

  test("renders green palette", () => {
    render(<Badge color="green">Green</Badge>);
    const el = screen.getByText("Green");
    expect(el).toHaveClass(
      "bg-green-100",
      "text-green-800",
      "border-green-200",
    );
  });

  test("renders red palette", () => {
    render(<Badge color="red">Red</Badge>);
    const el = screen.getByText("Red");
    expect(el).toHaveClass("bg-red-100", "text-red-800", "border-red-200");
  });
});
