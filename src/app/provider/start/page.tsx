import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";

export default async function ProviderStart() {
  const role = await getCurrentUserRole();

  if (!role) {
    redirect("/");
  }

  if (role === "provider") {
    redirect("/provider/dashboard");
  }

  if (role === "client") {
    return (
      <div>
        <h1>You already have a client account</h1>
        <p>You cannot register as a provider with this account.</p>
      </div>
    );
  }

  return null;
}