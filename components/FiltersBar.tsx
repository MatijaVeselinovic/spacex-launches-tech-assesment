"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import Button from "./Button";
import { Route } from "next";

type State = {
  status: "all" | "upcoming" | "past";
  success: "all" | "success" | "failure";
  sort: "date_desc" | "date_asc" | "name_asc" | "name_desc";
  search: string;
  from?: string;
  to?: string;
};

export default function FiltersBar({ initial }: { initial: State }) {
  const router = useRouter();
  const path = usePathname();

  const [state, setState] = useState<State>(initial);

  const update = useCallback(
    (partial: Partial<State>) => setState((s) => ({ ...s, ...partial })),
    [],
  );

  const apply = useCallback(() => {
    const q = new URLSearchParams();
    if (state.status !== "all") q.set("status", state.status);
    if (state.success !== "all") q.set("success", state.success);
    if (state.sort !== "date_desc") q.set("sort", state.sort);
    if (state.search) q.set("search", state.search);
    if (state.from) q.set("from", state.from);
    if (state.to) q.set("to", state.to);
    router.push(`${path}?${q.toString()}` as Route);
  }, [router, path, state]);

  const reset = useCallback(() => {
    setState({
      status: "all",
      success: "all",
      sort: "date_desc",
      search: "",
      from: undefined,
      to: undefined,
    });
    router.push(path as Route);
  }, [router, path]);

  return (
    <form
      className="grid md:grid-cols-6 gap-3 items-end mb-4"
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      <div className="flex flex-col">
        <label htmlFor="status" className="text-sm mb-1">
          Status
        </label>
        <select
          id="status"
          name="status"
          data-testid="status"
          className="border rounded px-2 py-2"
          value={state.status}
          onChange={(e) =>
            update({ status: e.target.value as State["status"] })
          }
        >
          <option value="all">All</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label htmlFor="outcome" className="text-sm mb-1">
          Outcome
        </label>
        <select
          id="outcome"
          name="outcome"
          data-testid="outcome"
          className="border rounded px-2 py-2"
          value={state.success}
          onChange={(e) =>
            update({ success: e.target.value as State["success"] })
          }
        >
          <option value="all">All</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label htmlFor="sort" className="text-sm mb-1">
          Sort
        </label>
        <select
          id="sort"
          name="sort"
          data-testid="sort"
          className="border rounded px-2 py-2"
          value={state.sort}
          onChange={(e) => update({ sort: e.target.value as State["sort"] })}
        >
          <option value="date_desc">Date ↓</option>
          <option value="date_asc">Date ↑</option>
          <option value="name_asc">Name A→Z</option>
          <option value="name_desc">Name Z→A</option>
        </select>
      </div>

      <div className="flex flex-col md:col-span-2">
        <label htmlFor="mission-name" className="text-sm mb-1">
          Mission name
        </label>
        <input
          id="mission-name"
          name="Mission name"
          data-testid="mission-name"
          className="border rounded px-2 py-2"
          placeholder="Search..."
          value={state.search}
          onChange={(e) => update({ search: e.target.value })}
        />
      </div>

      <div className="flex gap-2 md:col-span-2">
        <div className="flex-1 flex flex-col">
          <label htmlFor="from" className="text-sm mb-1">
            From
          </label>
          <input
            id="from"
            name="from"
            data-testid="from"
            type="date"
            className="border rounded px-2 py-2"
            value={state.from ?? ""}
            onChange={(e) => update({ from: e.target.value || undefined })}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <label htmlFor="to" className="text-sm mb-1">
            To
          </label>
          <input
            id="to"
            name="to"
            data-testid="to"
            type="date"
            className="border rounded px-2 py-2"
            value={state.to ?? ""}
            onChange={(e) => update({ to: e.target.value || undefined })}
          />
        </div>
      </div>

      <div className="flex gap-1">
        <Button type="submit" className="bg-black text-white">
          Apply Filters
        </Button>
        <Button type="button" onClick={reset}>
          Reset
        </Button>
      </div>
    </form>
  );
}
