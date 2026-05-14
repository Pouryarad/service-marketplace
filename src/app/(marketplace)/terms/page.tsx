export const metadata = { title: "Terms & Conditions | ProFindly" };

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f3f5f9] py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-black/[0.04]">
        <h1 className="text-3xl font-black text-[#0f1117] mb-2">Terms & Conditions</h1>
        <p className="text-sm text-[#9ca3af] mb-8">Last updated: May 14, 2026</p>

        <section className="space-y-6 text-sm text-[#374151] leading-relaxed">
          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">1. Overview</h2>
            <p>ProFindly ("we", "us", or "our") operates a service marketplace platform connecting clients with professional service providers. By using our platform at profindly.com, you agree to these Terms & Conditions. If you do not agree, please do not use the platform.</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">2. Eligibility</h2>
            <p>You must be at least 18 years old and a resident of Canada to use ProFindly. By registering, you confirm that the information you provide is accurate and complete.</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">3. Provider Accounts</h2>
            <p>Service providers must submit accurate professional information and valid identification for verification. ProFindly reserves the right to approve, reject, or suspend any provider account at its sole discretion. Providers are responsible for the accuracy of their profiles and the quality of their services.</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">4. Subscriptions & Payments</h2>
            <p>Providers pay a monthly subscription fee to maintain an active listing on ProFindly. Subscriptions are billed in advance on a monthly basis. A 14-day free trial may be offered to new providers. Payments are processed securely through Stripe. ProFindly does not store credit card information.</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">5. Refunds</h2>
            <p>Subscription fees are non-refundable except as required by applicable law. If you cancel your subscription, your listing will remain active until the end of the current billing period. See our full Refund Policy for details.</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">6. Client Use</h2>
            <p>Clients may browse and contact providers free of charge. Clients are responsible for independently verifying provider credentials and qualifications before engaging their services. ProFindly does not guarantee the quality, legality, or suitability of any service provider.</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">7. Prohibited Conduct</h2>
            <p>You may not use ProFindly to: post false or misleading information; harass or harm other users; circumvent our subscription model by directing clients to contact you off-platform; scrape or reproduce platform data; or violate any applicable laws.</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">8. Intellectual Property</h2>
            <p>All platform content, branding, and code is owned by ProFindly. Providers retain ownership of their profile content but grant ProFindly a license to display it on the platform.</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">9. Limitation of Liability</h2>
            <p>ProFindly is a directory and lead generation platform only. We are not a party to any agreement between clients and providers. To the maximum extent permitted by law, ProFindly is not liable for any damages arising from use of the platform or reliance on provider information.</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">10. Governing Law</h2>
            <p>These terms are governed by the laws of the Province of British Columbia and the federal laws of Canada applicable therein. Any disputes shall be resolved in the courts of British Columbia.</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">11. Changes to Terms</h2>
            <p>We may update these terms at any time. Continued use of ProFindly after changes constitutes acceptance of the new terms.</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">12. Contact</h2>
            <p>For questions about these terms, contact us at contact@profindly.com.</p>
          </div>
        </section>
      </div>
    </main>
  );
}