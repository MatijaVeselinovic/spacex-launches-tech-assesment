import { fmtDate } from "@/utils/format";

test("formats ISO date", () => {
  const s = fmtDate("2020-01-01T00:00:00.000Z");
  expect(typeof s).toBe("string");
  expect(s.length).toBeGreaterThan(5);
});
