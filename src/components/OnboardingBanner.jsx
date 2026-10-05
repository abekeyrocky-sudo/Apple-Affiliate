import React from 'react';

export default function OnboardingBanner({ onOpenOnboardModal, t }) {
  return (
    <section className="transition-all duration-300" id="onboardingBannerSection">
      <div className="bg-white border border-rose-200/90 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:border-[#E11D48]/50 transition-colors">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#E11D48] text-xl shadow-sm">
            <i className="fa-solid fa-crown"></i>
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-base text-slate-900">
              {t.onboard_banner_title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t.onboard_banner_desc}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col gap-2">
          <button
            onClick={onOpenOnboardModal}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:from-[#BE123C] hover:to-[#9F1239] active:scale-[0.98] transition-all text-white font-bold text-sm rounded-xl shadow-md shadow-[#E11D48]/25 flex items-center justify-center cursor-pointer"
          >
            {t.btn_join}
          </button>
          <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-500 mt-1">
            <span><i className="fa-solid fa-check text-[#10B981] mr-1"></i> Instant Approval</span>
            <span><i className="fa-solid fa-check text-[#10B981] mr-1"></i> Verified Link</span>
            <span><i className="fa-solid fa-check text-[#10B981] mr-1"></i> TRC-20 Payouts</span>
          </div>
        </div>
      </div>
    </section>
  );
}
