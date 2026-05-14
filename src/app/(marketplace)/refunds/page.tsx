export const metadata = { title: "Refund Policy | ProFindly" };

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-[#f3f5f9] py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-black/[0.04]">
        <h1 className="text-3xl font-black text-[#0f1117] mb-2">Refund Policy</h1>
        <p className="text-sm text-[#9ca3af] mb-8">Last updated: May 14, 2026</p>

        <section className="space-y-6 text-sm text-[#374151] leading-relaxed">
          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">1. Subscription Fees</h2>
            <p>ProFindly charges providers a monthly subscription fee to maintain an active listing on the platform. All subscription fees are billed in advance and are generally non-refundable.</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">2. Free Trial</h2>
            <p>New providers may receive a 14-day free trial. You will not be charged during the trial period. If you cancel before the trial ends, you will not be charged. After the trial, your subscription will automatically convert to a paid plan.</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">3. Cancellations</h2>
            <p>You may cancel your subscription at any time from your provider dashboard. Upon cancellation, your listing will remain active until the end of the current billing period. No partial refunds are issued for unused days in a billing period.</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">4. Exceptions</h2>
            <p>We may issue refunds in the following circumstances: duplicate charges caused by a billing error; charges made after a cancellation was confirmed; or as required by applicable Canadian consumer protection law. Refund requests must be submitted within 7 days of the charge to legal@profindly.com.</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">5. Account Suspension</h2>
            <p>If your account is suspended for violating our Terms & Conditions, no refund will be issued for the current billing period.</p>
          </div>

          <div>
            <h2 className="font-black text-[#0f1117] text-base mb-2">6. Contact</h2>
            <p>For refund requests or billing questions, contact us at legal@profindly.com.</p>
          </div>
        </section>
      </div>
    </main>
  );
}