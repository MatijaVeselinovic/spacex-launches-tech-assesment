import { render, screen, fireEvent } from "@/tests/test-utils";
import Button from "@/components/Button";

test("clicks button", () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick}>Click me</Button>);
  fireEvent.click(screen.getByText("Click me"));
  expect(onClick).toHaveBeenCalled();
});
