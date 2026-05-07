"use client";

import { useState } from "react";
import { markRequestContacted } from "@/lib/actions";

type Request = {
  id: string;
  clientName: string;
  clientEmail: string;
  phone?: string | null;
  message: string;
  status: string;
  created_at: string;
};

export default function DashboardRequests({ requests }: { requests: Request[] }) {
  const [items, setItems] = useState(requests.filter((r) => r.status === "new"));
  const [removing, setRemoving] = useState<string | null>(null);

  const handleContacted = async (id: string) => {
    setRemoving(id);
    const formData = new FormData();
    formData.set("requestId", id);
    await markRequestContacted(formData);
    setTimeout(() => {
      setItems((prev) => prev.filter((r) => r.id !== id));
      setRemoving(null);
    }, 400);
  };

  return (
    <div className="mt-4 space-y-3">
      {items.length === 0 ? (
        <p className="text-sm text-[#9ca3af]">No new requests.</p>
      ) : (
        items.slice(0, 2).map((request) => (
          <article
            key={request.id}
            style={{
              opacity: removing === request.id ? 0 : 1,
              transform: removing === request.id ? "translateY(-8px) scale(0.98)" : "translateY(0) scale(1)",
              maxHeight: removing === request.id ? "0" : "300px",
              marginBottom: removing === request.id ? "0" : undefined,
              overflow: "hidden",
              transition: "opacity 400ms ease, transform 400ms ease, max-height 400ms ease, margin 400ms ease",
            }}
            className="rounded-xl border border-[#2563eb]/15 bg-[#eff6ff] p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-[#1f1f1f]">{request.clientName}</p>
                  <span className="rounded-full bg-[#2563eb] px-2 py-0.5 text-[10px] font-bold text-white">New</span>
                </div>
                <p className="mt-0.5 text-xs text-[#6b7280]">
                  {request.clientEmail}
                  {request.phone ? ` · ${request.phone}` : ""}
                </p>
                <p className="mt-2 text-sm text-[#1f1f1f]">{request.message}</p>
              </div>
              <button
                onClick={() => handleContacted(request.id)}
                className="whitespace-nowrap rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold text-[#1f1f1f] transition hover:bg-[#f3f5f9]"
              >
                Mark contacted
              </button>
            </div>
          </article>
        ))
      )}
    </div>
  );
}