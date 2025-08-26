export type Id = string;

export type LaunchLinks = {
  patch?: { small?: string | null; large?: string | null } | null;
  webcast?: string | null;
  wikipedia?: string | null;
  article?: string | null;
  flickr?: { original?: string[] } | null;
};

export type Launch = {
  id: Id;
  name: string;
  date_utc: string;
  success: boolean | null;
  details?: string | null;
  rocket: Id | null;
  launchpad: Id | null;
  links: LaunchLinks;
  upcoming: boolean;
};

export type LaunchListItem = Pick<
  Launch,
  "id" | "name" | "date_utc" | "success" | "rocket" | "launchpad"
> & {
  links: { patch?: { small?: string | null } | null };
};

export type Rocket = {
  id: Id;
  name: string;
  description?: string | null;
  active: boolean;
  stages: number;
  boosters: number;
  cost_per_launch: number;
  success_rate_pct: number;
  first_flight: string;
};

export type Launchpad = {
  id: Id;
  name: string;
  region: string;
  locality?: string | null;
  full_name?: string | null;
};

export type Paginated<T> = {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
};
