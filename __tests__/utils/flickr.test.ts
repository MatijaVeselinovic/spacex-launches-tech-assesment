import { toSizedFlickr } from "@/utils/flickr";

test("rewrites flickr url to z size", () => {
  const u = "https://live.staticflickr.com/abc/photo.jpg";
  expect(toSizedFlickr(u)).toMatch(/_z\.jpg$/);
});
