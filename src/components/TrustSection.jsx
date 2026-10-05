import React from 'react';

export default function TrustSection() {
  return (
    <>
      <section className="grid grid-cols-2 gap-2.5 pt-2">
        <div className="bg-white border border-slate-200 p-3 rounded-xl card-shadow">
          <i className="fa-solid fa-shield-halved text-[#10B981] text-base mb-1.5 block"></i>
          <h6 className="text-xs font-bold text-slate-900">Anti-Cheat Engine</h6>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Real Telegram player verification protects creator attribution.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-xl card-shadow">
          <i className="fa-brands fa-telegram text-[#2AABEE] text-base mb-1.5 block"></i>
          <h6 className="text-xs font-bold text-slate-900">Creator Chat</h6>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Direct 24/7 support line for verified influencers.
          </p>
        </div>
      </section>

      {/* Bottom Mini-App Bar */}
      <div className="px-4 mt-6 text-center text-slate-400 text-[11px]">
        Apple Farm TMA Affiliate Engine v2.4 • Secured via TON &amp; USDT TRC-20
      </div>
    </>
  );
}
