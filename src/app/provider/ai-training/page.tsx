import { getCurrentProviderProfile } from "@/lib/data";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AITrainingForm from "@/components/AITrainingForm";

export default async function AITrainingPage() {
  const provider = await getCurrentProviderProfile();
  if (!provider) redirect("/provider/setup");

  const supabase = await createSupabaseServerClient();
  const { data: existingQA } = await supabase!
    .from("provider_qa")
    .select("id, question, answer, ai_approved, ai_rejection_reason, answered_at")
    .eq("provider_id", Number(provider.id))
    .order("created_at", { ascending: true });

  return (
    <main className="min-h-screen bg-[#f3f5f9]">
      <section className="mx-auto w-full max-w-3xl px-4 pb-20 pt-6 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#0f1117]">AI Training</h1>
          <p className="text-sm text-[#9ca3af] mt-0.5">
            Answer these questions to help our AI match you with the right clients.
          </p>
        </div>
        <AITrainingForm
          provider={provider}
          existingQA={existingQA ?? []}
        />
      </section>
    </main>
  );
}