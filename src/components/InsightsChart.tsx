"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type InsightBucket = {
  count_day: number;
  count_week: number;
  count_month: number;
  count_total: number;
};

type Props = {
  profileViews: InsightBucket;
  emailReveals: InsightBucket;
  phoneReveals: InsightBucket;
  contactRequests: InsightBucket;
};

export default function InsightsChart({ profileViews, emailReveals, phoneReveals, contactRequests }: Props) {
  const data = [
    {
      label: "Today",
      "Profile Views": profileViews.count_day,
      "Email Reveals": emailReveals.count_day,
      "Phone Reveals": phoneReveals.count_day,
      "Contact Requests": contactRequests.count_day,
    },
    {
      label: "This Week",
      "Profile Views": profileViews.count_week,
      "Email Reveals": emailReveals.count_week,
      "Phone Reveals": phoneReveals.count_week,
      "Contact Requests": contactRequests.count_week,
    },
    {
      label: "This Month",
      "Profile Views": profileViews.count_month,
      "Email Reveals": emailReveals.count_month,
      "Phone Reveals": phoneReveals.count_month,
      "Contact Requests": contactRequests.count_month,
    },
    {
      label: "All Time",
      "Profile Views": profileViews.count_total,
      "Email Reveals": emailReveals.count_total,
      "Phone Reveals": phoneReveals.count_total,
      "Contact Requests": contactRequests.count_total,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barSize={14} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }} cursor={{ fill: "#f3f5f9" }} />
        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
        <Bar dataKey="Profile Views" fill="#2563eb" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Email Reveals" fill="#ff8a00" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Phone Reveals" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Contact Requests" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}