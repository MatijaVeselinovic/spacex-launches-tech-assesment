"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";

type Item = { date_utc: string; success: boolean | null };

export default function ChartsClient({ raw }: { raw: Item[] }) {
  const perYear = useMemo(() => {
    const by: Record<string, { year: string; total: number; success: number }> =
      {};
    for (const r of raw) {
      const y = new Date(r.date_utc).getUTCFullYear().toString();
      if (!by[y]) by[y] = { year: y, total: 0, success: 0 };
      by[y].total++;
      if (r.success) by[y].success++;
    }
    const arr = Object.values(by).sort((a, b) => a.year.localeCompare(b.year));
    return {
      count: arr.map((x) => ({ year: x.year, launches: x.total })),
      rate: arr.map((x) => ({
        year: x.year,
        rate: Math.round((x.success / x.total) * 100),
      })),
    };
  }, [raw]);

  return (
    <div className="grid gap-6">
      <div className="w-full h-72 border rounded p-2">
        <ResponsiveContainer>
          <BarChart data={perYear.count}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="launches" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="w-full h-72 border rounded p-2">
        <ResponsiveContainer>
          <LineChart data={perYear.rate}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="rate" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
