import { BriefcaseBusiness, Search } from "lucide-react";
import { saveAudienceChoice } from "@/lib/actions";
import { Logo } from "@/components/logo";

export default function OnboardingPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f3f5f9] px-4">
      <section className="w-full max-w-3xl rounded-[8px] bg-white p-6 text-center">
        <Logo centered />
        <h1 className="mt-8 font-display text-3xl font-bold">What would you like to do?</h1>
        <form action={saveAudienceChoice} className="mt-6 grid gap-4 sm:grid-cols-2">
          <button name="choice" value="client" className="rounded-[8px] border border-black/10 p-6 text-left transition hover:border-[#2563eb]">
            <Search className="text-[#2563eb]" />
            <span className="mt-4 block font-display text-2xl font-bold">Find service</span>
            <span className="mt-2 block text-sm leading-6 text-[#6b7280]">
              Save favorites and send contact requests.
            </span>
          </button>
          <button name="choice" value="provider" className="rounded-[8px] border border-black/10 p-6 text-left transition hover:border-[#ff8a00]">
            <BriefcaseBusiness className="text-[#ff8a00]" />
            <span className="mt-4 block font-display text-2xl font-bold">Get clients</span>
            <span className="mt-2 block text-sm leading-6 text-[#6b7280]">
              Build a profile, subscribe, and receive leads.
            </span>
          </button>
        </form>
      </section>
    </main>
  );
}
