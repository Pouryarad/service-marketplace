"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Props = {
  clicksDay: number;
  clicksWeek: number;
  clicksMonth: number;
  totalLeads: number;
};

export default function InsightsChart({ clicksDay, clicksWeek, clicksMonth, totalLeads }: Props) {
  const data = [
    { label: "Today", views: clicksDay },
    { label: "This Week", views: clicksWeek },
    { label: "This Month", views: clicksMonth },
    { label: "Total Leads", views: totalLeads },
  ];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barSize={32}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            fontSize: "12px",
          }}
          cursor={{ fill: "#f3f5f9" }}
        />
        <Bar dataKey="views" fill="#2563eb" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}