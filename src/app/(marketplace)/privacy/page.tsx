export const metadata = { title: "Privacy Policy | ProFindly" };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f3f5f9] py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-black/[0.04]">
        <h1 className="text-3xl font-black text-[#0f1117] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#9ca3af] mb-8">Last updated: May 14, 2026</p>

        <section className="space-y-6 text-sm text-[#374151] leading-relaxed">
          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">1. Who We Are</h2>
            <p>ProFindly is a service marketplace platform operated in British Columbia, Canada. This Privacy Policy explains how we collect, use, and protect your personal information in accordance with British Columbia's Personal Information Protection Act (PIPA) and Canada's Personal Information Protection and Electronic Documents Act (PIPEDA).</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">2. Information We Collect</h2>
            <p><strong>Providers:</strong> Full name, business name, email, phone number, location, professional category, profile photo, portfolio photos, introduction video, government-issued ID or professional license, and billing information (processed by Stripe).</p>
            <p className="mt-2"><strong>Clients:</strong> Name, email address, and any information voluntarily submitted in contact request forms.</p>
            <p className="mt-2"><strong>All users:</strong> Google OAuth data (name, email, profile photo) when signing in with Google. Usage data including page views and interaction events.</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">3. How We Use Your Information</h2>
            <p>We use your information to: operate and improve the platform; verify provider identities and credentials; process subscription payments; connect clients with providers; send transactional emails (approvals, billing, updates); and comply with legal obligations.</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">4. Sharing of Information</h2>
            <p>We do not sell your personal information. We share data only with: Supabase (database and storage), Stripe (payment processing), Resend (transactional email), and Cloudflare (bot protection). All third-party providers are bound by confidentiality agreements.</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">5. Provider Profile Data</h2>
            <p>Provider profiles (name, photo, category, location, contact info) are publicly visible on the platform. ID documents and licenses are stored securely and are only accessible to ProFindly administrators for verification purposes.</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">6. Data Retention</h2>
            <p>We retain your data for as long as your account is active. If you delete your account, we will remove your personal data within 30 days, except where retention is required by law.</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">7. Your Rights</h2>
            <p>Under PIPA and PIPEDA, you have the right to: access your personal information; correct inaccurate data; withdraw consent for non-essential uses; and request deletion of your data. To exercise these rights, contact us at contact@profindly.com.</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">8. Cookies</h2>
            <p>We use essential cookies for authentication and session management. We use Cloudflare Turnstile for bot protection, which may set its own cookies. We do not use advertising or tracking cookies.</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">9. Security</h2>
            <p>We implement industry-standard security measures including encrypted data storage, secure HTTPS connections, and access controls. However, no system is completely secure and we cannot guarantee absolute security.</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">10. Contact</h2>
            <p>For privacy-related inquiries, contact our Privacy Officer at contact@profindly.com.</p>
          </div>
        </section>
      </div>
    </main>
  );
}