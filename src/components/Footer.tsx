import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-black/[0.06] bg-white px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div>
            <p className="font-black text-[#0f1117] tracking-tight">ProFindly</p>
            <p className="mt-1 text-xs text-[#9ca3af]">Find the right service in your area.</p>
            <p className="mt-1 text-xs text-[#9ca3af]">© {new Date().getFullYear()} ProFindly. All rights reserved.</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm">
            <div className="flex flex-col gap-2">
              <p className="font-bold text-xs text-[#9ca3af] uppercase tracking-wider">Platform</p>
              <Link href="/" className="text-[#374151] hover:text-[#0f1117] transition-colors">Home</Link>
              <Link href="/provider/start" className="text-[#374151] hover:text-[#0f1117] transition-colors">Get Clients</Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-bold text-xs text-[#9ca3af] uppercase tracking-wider">Legal</p>
              <Link href="/terms" className="text-[#374151] hover:text-[#0f1117] transition-colors">Terms & Conditions</Link>
              <Link href="/privacy" className="text-[#374151] hover:text-[#0f1117] transition-colors">Privacy Policy</Link>
              <Link href="/refunds" className="text-[#374151] hover:text-[#0f1117] transition-colors">Refund Policy</Link>
              <Link href="/cookies" className="text-[#374151] hover:text-[#0f1117] transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}