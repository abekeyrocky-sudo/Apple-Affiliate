import React from 'react';
import { LANG_DATA } from '../constants/translations';

export default function LangModal({ isOpen, onClose, onSelectLang, t }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-200">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl animate-pop text-center relative overflow-hidden">
        {/* Decorative radial accent */}
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-[#E11D48]/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-[#E11D48] flex items-center justify-center mx-auto text-xl mb-3 shadow-inner">
          <i className="fa-solid fa-earth-americas"></i>
        </div>

        <h3 className="text-lg font-display font-extrabold text-slate-900">
          {t.lang_modal_title}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {t.lang_modal_desc}
        </p>

        {/* Horizontal Snap Carousel for Languages */}
        <div className="mt-5 pb-1 flex space-x-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-2">
          {Object.entries(LANG_DATA).map(([code, item]) => (
            <button
              key={code}
              onClick={() => onSelectLang(code, item)}
              className="snap-center shrink-0 w-28 p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#E11D48] hover:bg-rose-50/40 active:scale-95 transition-all text-center group shadow-sm cursor-pointer"
            >
              <span className="text-3xl block mb-1">{item.flag}</span>
              <span className="text-xs font-bold text-slate-900 group-hover:text-[#BE123C] block">
                {item.name}
              </span>
              <span className="text-[10px] text-slate-500">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center space-x-1 text-slate-400 text-[10px]">
          <i className="fa-solid fa-arrows-left-right mr-1"></i>
          <span>Swipe horizontally to browse languages</span>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
        >
          {t.btn_continue_lang}
        </button>
      </div>
    </div>
  );
}
