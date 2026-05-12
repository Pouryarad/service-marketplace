"use client";

import { useEffect, useState } from "react";

export default function RoleConflictModal({ actualRole }: { actualRole: "client" | "provider" }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const pending = localStorage.getItem("pendingRole");

    if (pending && pending !== actualRole) {
      setShow(true);
    }
    localStorage.removeItem("pendingRole");
  }, [actualRole]);

  if (!show) return null;

  if (actualRole === "client") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">👤</div>
          <h2 className="text-xl font-black text-[#0f1117] mb-2">Already a Client</h2>
          <p className="text-sm text-[#6b7280] mb-6 leading-relaxed">
            This Google account is registered as a <strong>client</strong>. To become a provider, please sign up with a different account.
          </p>
          <div className="flex flex-col gap-2">
            <a href="/dashboard" className="w-full rounded-xl bg-[#0f1117] py-3 text-sm font-bold text-white text-center">
              Go to Dashboard
            </a>
            <a href="/" className="w-full rounded-xl border border-black/10 py-3 text-sm font-bold text-[#6b7280] text-center">
              Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center">
        <div className="text-4xl mb-4">🏢</div>
        <h2 className="text-xl font-black text-[#0f1117] mb-2">Already a Provider</h2>
        <p className="text-sm text-[#6b7280] mb-6 leading-relaxed">
          This Google account is registered as a <strong>provider</strong>. Please use the provider login.
        </p>
        <a href="/provider/dashboard" className="w-full rounded-xl bg-[#0f1117] py-3 text-sm font-bold text-white text-center block">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}