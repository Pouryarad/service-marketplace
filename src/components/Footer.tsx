import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#0f1117] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <p className="text-lg font-black text-white tracking-tight">ProFindly</p>
            <p className="mt-2 text-sm text-[#6b7280] leading-relaxed">Find local professionals in seconds.</p>
          </div>

          {/* Links */}
          <div className="flex gap-12 text-sm">
            <div className="flex flex-col gap-3">
              <p className="font-bold text-xs text-[#4b5563] uppercase tracking-widest">Platform</p>
              <Link href="/" target="_blank" className="text-[#9ca3af] hover:text-white transition-colors">Home</Link>
              <Link href="/provider/start" target="_blank" className="text-[#9ca3af] hover:text-white transition-colors">Get Clients</Link>
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-bold text-xs text-[#4b5563] uppercase tracking-widest">Legal</p>
              <Link href="/terms" target="_blank" className="text-[#9ca3af] hover:text-white transition-colors">Terms & Conditions</Link>
              <Link href="/privacy" target="_blank" className="text-[#9ca3af] hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/refunds" target="_blank" className="text-[#9ca3af] hover:text-white transition-colors">Refund Policy</Link>
              <Link href="/cookies" target="_blank" className="text-[#9ca3af] hover:text-white transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-[#4b5563]">© {new Date().getFullYear()} ProFindly. All rights reserved.</p>
          <p className="text-xs text-[#4b5563]">British Columbia, Canada</p>
        </div>
      </div>
    </footer>
  );
}