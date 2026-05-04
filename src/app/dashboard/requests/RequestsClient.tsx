"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function RequestsClient({ requests }: any) {
  const sortedRequests = [...requests].sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  );

  const categories = [
    "all",
    ...Array.from(
      new Set(sortedRequests.map((r) => r.provider?.category_slug))
    ),
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredRequests =
    selectedCategory === "all"
      ? sortedRequests
      : sortedRequests.filter(
          (r) => r.provider?.category_slug === selectedCategory
        );

  return (
    <main className="min-h-screen bg-[#f3f5f9]">
      <section className="mx-auto w-full max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-bold">My Requests</h1>

        {/* FILTER */}
        <div className="mt-4 flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                selectedCategory === cat
                  ? "bg-black text-white"
                  : "bg-white text-gray-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* GRID */}
        {filteredRequests.length === 0 ? (
          <p className="mt-6 text-sm text-gray-500">No requests yet</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRequests.map((req) => (
              <Link
                key={req.id}
                href={`/providers/${req.provider?.id}`}
                className="rounded-[12px] border border-black/10 bg-white p-4 hover:shadow transition"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 ring-1 ring-black/10 flex-shrink-0">
                    {req.provider?.profile_photo_url ? (
                      <Image
                        src={req.provider.profile_photo_url}
                        alt=""
                        width={96}
                        height={96}
                        sizes="48px"
                        className="object-cover h-full w-full"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        👤
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {req.provider?.full_name}
                    </p>

                    <p className="text-xs text-gray-500 capitalize">
                      {req.provider?.category_slug}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}