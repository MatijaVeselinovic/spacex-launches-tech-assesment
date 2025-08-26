// Jest setup
import "@testing-library/jest-dom";

// Minimal next/navigation mocks used by our components
jest.mock("next/navigation", () => {
  const push = jest.fn();
  const replace = jest.fn();
  const prefetch = jest.fn();
  const back = jest.fn();
  return {
    useRouter: () => ({ push, replace, prefetch, back }),
    usePathname: () => "/launches",
    useSearchParams: () => new URLSearchParams(),
  };
});
