"use client";

import { useState } from "react";
import { requestAccountDelete } from "@/lib/actions";

export default function DeleteAccountModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger */}
      <button
  onClick={() => setOpen(true)}
  className="w-full rounded-full bg-red-600 text-white py-2 font-semibold hover:opacity-90 transition"
>
  Delete Account
</button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-[12px] p-6 w-full max-w-sm space-y-4">

            <h2 className="text-lg font-bold">
              Delete Account
            </h2>

            <p className="text-sm text-gray-600">
              Are you sure you want to delete your account and data?
            </p>

            <form action={requestAccountDelete} className="space-y-3">

              <button
                type="submit"
                className="w-full rounded-full bg-red-600 text-white py-2 font-semibold"
              >
                Request Account Deletion
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-full bg-[#2563eb] text-white py-2"
              >
                Cancel
              </button>

            </form>
          </div>
        </div>
      )}
    </>
  );
}