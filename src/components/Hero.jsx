import React from 'react';

export default function Hero({ t }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50/60 via-white to-emerald-50/40 border border-rose-200/60 p-5 shadow-sm">
      <div className="absolute -right-8 -top-8 w-36 h-36 bg-[#E11D48]/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-[#10B981]/10 rounded-full blur-xl pointer-events-none"></div>

      <div className="relative z-10">
        <div className="inline-flex items-center space-x-1.5 bg-rose-50 border border-[#E11D48]/30 text-[#E11D48] px-2.5 py-1 rounded-full text-xs font-semibold mb-2.5 shadow-sm">
          <i className="fa-solid fa-apple-whole text-[11px] text-[#E11D48]"></i>
          <span>{t.hero_badge}</span>
        </div>

        <h2 className="text-2xl font-extrabold font-display tracking-tight text-slate-900 leading-tight">
          {t.hero_title}{' '}
          <span className="text-[#E11D48]">{t.hero_title_highlight || 'Apple Farm'}</span>
        </h2>

        <p className="text-xs text-slate-600 mt-2 leading-relaxed font-normal">
          {t.hero_desc}
        </p>

        {/* Metric Highlights Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-200/80">
          <div className="bg-white/90 rounded-xl p-2.5 border border-slate-200 shadow-sm text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              {t.reward_label}
            </span>
            <span className="text-sm font-extrabold text-[#059669] mt-0.5 block">
              Up to $25
            </span>
          </div>

          <div className="bg-white/90 rounded-xl p-2.5 border border-slate-200 shadow-sm text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              {t.network_label}
            </span>
            <span className="text-sm font-extrabold text-blue-600 mt-0.5 block">
              TRC-20
            </span>
          </div>

          <div className="bg-white/90 rounded-xl p-2.5 border border-slate-200 shadow-sm text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              {t.speed_label}
            </span>
            <span className="text-sm font-extrabold text-[#E11D48] mt-0.5 block">
              {t.speed_val}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
