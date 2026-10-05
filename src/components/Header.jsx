import React from 'react';
import { LANG_DATA } from '../constants/translations';

export default function Header({ currentLang, onOpenLangModal, t }) {
  const langInfo = LANG_DATA[currentLang] || LANG_DATA.en;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#BE123C] flex items-center justify-center shadow-md shadow-[#E11D48]/25 text-white text-lg font-black">
          <i className="fa-solid fa-apple-whole text-rose-100 drop-shadow-sm"></i>
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <h1 className="font-display font-extrabold text-base tracking-tight text-slate-900 leading-none">
              Apple Farm
            </h1>
            <span className="bg-[#10B981]/15 text-[#059669] border border-[#10B981]/30 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide">
              TMA
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-none mt-1">
            {t.hub_sub}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          id="langBadgeBtn"
          onClick={onOpenLangModal}
          className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 hover:border-[#E11D48]/60 active:scale-95 transition-all text-xs px-2.5 py-1.5 rounded-full shadow-sm cursor-pointer"
        >
          <span className="text-sm">{langInfo.flag}</span>
          <span className="font-semibold text-slate-800">{langInfo.label}</span>
          <i className="fa-solid fa-chevron-down text-[9px] text-slate-400 ml-0.5"></i>
        </button>
        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm">
          <i className="fa-brands fa-telegram text-[#2AABEE]"></i>
        </div>
      </div>
    </header>
  );
}
