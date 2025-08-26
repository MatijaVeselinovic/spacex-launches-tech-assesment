import { format, parseISO } from "date-fns";

/**
 * A simple format method to parse the date into a nice format.
 */
export function fmtDate(iso: string) {
  try {
    return format(parseISO(iso), "PPpp");
  } catch {
    return iso;
  }
}
