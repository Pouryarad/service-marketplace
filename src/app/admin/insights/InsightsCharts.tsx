"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";

type Props = {
  signupChartData: { label: string; clients: number; providers: number }[];
  topViewed: { name: string; value: number }[];
  topContacted: { name: string; value: number }[];
};

export default function InsightsCharts({ signupChartData, topViewed, topContacted }: Props) {
  return (
    <div className="space-y-6">

      {/* Signups Chart */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-bold text-[#1f1f1f] mb-4">New Signups (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={signupChartData} barSize={16}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Bar dataKey="clients" fill="#2563eb" radius={[4, 4, 0, 0]} />
            <Bar dataKey="providers" fill="#ff8a00" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Viewed + Contacted */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-bold text-[#1f1f1f] mb-4">Most Viewed Providers</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={topViewed} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
              <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-bold text-[#1f1f1f] mb-4">Most Contacted Providers</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={topContacted} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
              <Bar dataKey="value" fill="#ff8a00" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}