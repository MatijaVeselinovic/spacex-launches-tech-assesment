export type FlickrSize = "q" | "m" | "n" | "z" | "c" | "b" | "h" | "k" | "o";

/**
 * Turn a Flickr static URL into a sized variant (e.g., _z for ~640px).
 * If it already has a size suffix, we replace it; otherwise we insert it.
 */
export function toSizedFlickr(url: string, size: FlickrSize = "z"): string {
  try {
    return url.replace(/(?:_[a-zA-Z])?\.(jpg|jpeg|png|webp)$/i, `_${size}.$1`);
  } catch {
    return url;
  }
}
