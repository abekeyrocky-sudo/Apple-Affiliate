import React from 'react';
import { openTelegramLink, SUPPORT_BOT_URL } from '../utils/telegram';

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

        <div 
          onClick={() => openTelegramLink(SUPPORT_BOT_URL)}
          role="button"
          tabIndex={0}
          title="Open Telegram Support Bot"
          className="bg-white border border-slate-200 hover:border-[#2AABEE]/60 active:scale-95 transition-all p-3 rounded-xl card-shadow cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <i className="fa-brands fa-telegram text-[#2AABEE] text-base group-hover:scale-110 transition-transform block"></i>
              <span className="text-[9px] font-bold text-[#2AABEE] bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <span>Chat</span>
                <i className="fa-solid fa-arrow-up-right-from-square text-[7px]"></i>
              </span>
            </div>
            <h6 className="text-xs font-bold text-slate-900 group-hover:text-[#2AABEE] transition-colors">
              Creator Chat
            </h6>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Direct 24/7 support line for verified influencers.
            </p>
          </div>
          <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center text-[10px] font-bold text-[#2AABEE]">
            <span>@AppleFarm_Support_bot</span>
          </div>
        </div>
      </section>

      {/* Bottom Mini-App Bar */}
      <div className="px-4 mt-6 text-center text-slate-400 text-[11px]">
        Apple Farm TMA Affiliate Engine v2.4 • Secured via TON &amp; USDT TRC-20
      </div>
    </>
  );
}
