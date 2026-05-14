export const metadata = { title: "Cookie Policy | ProFindly" };

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[#f3f5f9] py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-black/[0.04]">
        <h1 className="text-3xl font-black text-[#0f1117] mb-2">Cookie Policy</h1>
        <p className="text-sm text-[#9ca3af] mb-8">Last updated: May 14, 2026</p>

        <section className="space-y-6 text-sm text-[#374151] leading-relaxed">
          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">1. What Are Cookies</h2>
            <p>Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and session information.</p>
          </div>
          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">2. Cookies We Use</h2>
            <p><strong>Essential cookies:</strong> Required for authentication and session management. These cannot be disabled.</p>
            <p className="mt-2"><strong>Cloudflare Turnstile:</strong> Used for bot protection on forms. Sets temporary cookies to verify human users.</p>
            <p className="mt-2"><strong>User role cookie:</strong> Stores your account type (client/provider) to display the correct navigation.</p>
          </div>
          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">3. What We Don't Use</h2>
            <p>We do not use advertising cookies, third-party tracking cookies, or analytics cookies that track you across other websites.</p>
          </div>
          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">4. Managing Cookies</h2>
            <p>You can control cookies through your browser settings. Disabling essential cookies may prevent you from signing in or using the platform.</p>
          </div>
          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">5. Contact</h2>
            <p>For questions about our cookie use, contact contact@profindly.com.</p>
          </div>
        </section>
      </div>
    </main>
  );
}