import { TopNav } from "@/components/nav";
import { saveProviderProfile } from "@/lib/actions";
import { getCategories, getCurrentUser } from "@/lib/data";

export default async function ProviderSetupPage() {
  const [categories, user] = await Promise.all([getCategories(), getCurrentUser()]);

  return (
    <main className="min-h-screen bg-[#f3f5f9]">
      <TopNav variant="provider" />
      <section className="mx-auto w-full max-w-3xl px-4 pb-14 sm:px-6">
        <div className="rounded-[8px] bg-white p-6">
          <h1 className="font-display text-3xl font-bold">Complete provider profile</h1>
          <form action={saveProviderProfile} className="mt-6 grid gap-4">
            <input name="fullName" required placeholder="Full Name" className="h-12 rounded-[8px] border border-black/10 px-3" />
            <input name="businessName" placeholder="Business Name (optional)" className="h-12 rounded-[8px] border border-black/10 px-3" />
            <select name="categoryId" required className="h-12 rounded-[8px] border border-black/10 px-3">
              <option value="">Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <label className="text-sm font-semibold text-[#4b5563]">
              Profile Photo
              <input name="profilePhoto" type="file" accept="image/*" className="mt-2 w-full rounded-[8px] border border-black/10 bg-white px-3 py-3" />
            </label>
            <label className="text-sm font-semibold text-[#4b5563]">
              Portfolio Photos
              <input name="portfolioPhotos" type="file" accept="image/*" multiple className="mt-2 w-full rounded-[8px] border border-black/10 bg-white px-3 py-3" />
            </label>
            <textarea name="portfolioPhotoUrls" placeholder="Optional portfolio photo URLs, one per line" className="min-h-24 rounded-[8px] border border-black/10 p-3" />
            <input name="email" defaultValue={user?.email ?? ""} placeholder="Email" className="h-12 rounded-[8px] border border-black/10 px-3" />
            <input name="phone" placeholder="Phone" className="h-12 rounded-[8px] border border-black/10 px-3" />
            <input name="location" placeholder="Location" className="h-12 rounded-[8px] border border-black/10 px-3" />
            <input name="language" placeholder="Language" className="h-12 rounded-[8px] border border-black/10 px-3" />
            <input name="oneLine" placeholder="1-line description" className="h-12 rounded-[8px] border border-black/10 px-3" />
            <textarea name="bio" placeholder="Bio" className="min-h-32 rounded-[8px] border border-black/10 p-3" />
            <button className="rounded-full bg-[#2563eb] px-5 py-3 font-bold text-white">
              Submit for review
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
