"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/** Simple 7-day signups bar chart for the admin overview. */
export function SignupsChart({ data }: { data: { day: string; count: number }[] }) {
  const rows = data.map((d) => ({
    label: new Date(d.day).toLocaleDateString(undefined, {
      weekday: "short",
    }),
    count: d.count,
  }));

  return (
    <div className="h-44">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: "#7A6B95", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#7A6B95", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              background: "#16092E",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              color: "#fff",
            }}
            formatter={(v) => [`${v}`, "Signups"]}
          />
          <Bar dataKey="count" fill="#FF1F8F" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
