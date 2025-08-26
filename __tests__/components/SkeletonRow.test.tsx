import { render } from "@/tests/test-utils";
import SkeletonRow from "@/components/SkeletonRow";

test("renders skeleton row", () => {
  const { container } = render(<SkeletonRow />);
  expect(container.firstChild).toBeInTheDocument();
});
