import React, { useState } from 'react';

const BOT_USERNAME = "Apple_AffiliateBot";

export default function Dashboard({ 
  userData, 
  currentUser, 
  earnedBalance, 
  maxReward = 25.00,
  onOpenCashoutModal, 
  onVerifyVideo,
  onSubmitMilestone,
  onCopyReferral,
  t 
}) {
  const [isVideoVerifyOpen, setIsVideoVerifyOpen] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [isMilestoneDropdownOpen, setIsMilestoneDropdownOpen] = useState(false);
  
  // Track collapsible input visibility for each tier
  const [milestoneInputsOpen, setMilestoneInputsOpen] = useState({
    '1k': false,
    '2k': false,
    '3k': false
  });
  
  const [milestoneUrls, setMilestoneUrls] = useState({
    '1k': '',
    '2k': '',
    '3k': ''
  });

  const [milestoneCheckResults, setMilestoneCheckResults] = useState({});

  const isTelegram = userData?.platform === 'Telegram';
  const targetPool = maxReward || (isTelegram ? 10.00 : 25.00);

  const percent = Math.min(Math.round((earnedBalance / targetPool) * 100), 100);
  const remaining = Math.max(0, targetPool - earnedBalance).toFixed(2);

  const videoStatus = userData?.tasks?.video_post?.status || userData?.taskVideoStatus || 'pending';
  const isVideoApproved = videoStatus === 'approved';
  const isVideoUnderReview = videoStatus === 'under_review';

  const [submittingVideo, setSubmittingVideo] = useState(false);
  const [submittingTier, setSubmittingTier] = useState({});

  // Toggle video input
  const handleToggleVideoVerify = () => {
    setIsVideoVerifyOpen(!isVideoVerifyOpen);
  };

  const handleConfirmVideoSubmit = async () => {
    if (!videoUrlInput.trim()) return;
    setSubmittingVideo(true);
    try {
      await onVerifyVideo(videoUrlInput.trim());
      setVideoUrlInput('');
      setIsVideoVerifyOpen(false);
    } catch (err) {
      // Toast displayed in App.jsx
    } finally {
      setSubmittingVideo(false);
    }
  };

  // Toggle milestone inputs
  const toggleMilestoneInput = (tier) => {
    setMilestoneInputsOpen(prev => ({
      ...prev,
      [tier]: !prev[tier]
    }));
  };

  const handleMilestoneSubmit = async (tier, amount) => {
    const url = milestoneUrls[tier]?.trim();
    if (!url) return;
    setSubmittingTier(prev => ({ ...prev, [tier]: true }));
    try {
      const result = await onSubmitMilestone(tier, amount, url);
      if (result) {
        setMilestoneCheckResults(prev => ({ ...prev, [tier]: result }));
        if (result.success) {
          setMilestoneUrls(prev => ({ ...prev, [tier]: '' }));
          setMilestoneInputsOpen(prev => ({ ...prev, [tier]: false }));
        }
      }
    } catch (err) {
      // Toast displayed in App.jsx
    } finally {
      setSubmittingTier(prev => ({ ...prev, [tier]: false }));
    }
  };

  const renderTierButton = (tier, amount) => {
    const tierStatus = userData?.tasks?.[tier]?.status;

    if (tierStatus === 'approved') {
      return (
        <span className="text-[11px] font-bold text-[#059669] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
          {t.btn_completed}
        </span>
      );
    }
    if (tierStatus === 'under_review') {
      return (
        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
          {t.btn_under_review}
        </span>
      );
    }
    if (tierStatus === 'rejected') {
      return (
        <button
          onClick={() => toggleMilestoneInput(tier)}
          className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg cursor-pointer"
        >
          Rejected (Retry)
        </button>
      );
    }

    const isOpen = milestoneInputsOpen[tier];
    return (
      <button
        onClick={() => toggleMilestoneInput(tier)}
        className="text-[11px] font-bold text-white bg-[#E11D48] hover:bg-[#BE123C] active:scale-95 transition-all px-3.5 py-1 rounded-lg shadow-sm cursor-pointer"
      >
        {isOpen ? 'Cancel' : t.btn_claim}
      </button>
    );
  };

  const referralLink = isVideoApproved && currentUser?.id 
    ? `https://t.me/${BOT_USERNAME}?start=aff_${currentUser.id}`
    : `https://t.me/${BOT_USERNAME}?start=locked_${currentUser?.id || 'creator'}`;

  // Milestone Tiers Config
  const tiers = isTelegram ? [
    { key: '1k', label: '500 Views', amount: 1.00, hint: 'Initial Post Reach' },
    { key: '2k', label: '1,000 Views', amount: 2.00, hint: 'Mid Channel Milestone' },
    { key: '3k', label: '2,000 Views', amount: 2.00, hint: 'Final Reach Milestone' }
  ] : [
    { key: '1k', label: '1,000 Views', amount: 2.00, hint: 'Initial Video Milestone' },
    { key: '2k', label: '2,000 Views', amount: 3.00, hint: 'Mid Video Milestone' },
    { key: '3k', label: '3,900 Views', amount: 5.00, hint: 'Final Video Milestone' }
  ];

  return (
    <section className="space-y-4 transition-all duration-500" id="dashboardSection">
      {/* 1. Creator Profile Chip & Balance Card */}
      <div className="space-y-3">
        {/* Creator Profile Chip */}
        <div className="flex items-center justify-between bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E11D48] to-rose-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              AF
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-slate-900 tracking-tight" id="profileCreatorName">
                  {userData?.channelTitle || userData?.firstName || userData?.username || currentUser?.first_name || "Active Creator"}
                </span>
                <i className="fa-solid fa-circle-check text-[#10B981] text-[11px]"></i>
              </div>
              <span className="text-[10px] text-slate-500 font-medium" id="profilePlatformBadge">
                {userData?.platform || 'Creator'} • {userData?.followers || '0'}
              </span>
            </div>
          </div>
          <span className="bg-emerald-50 text-[#059669] border border-emerald-200 text-[11px] font-semibold px-2 py-0.5 rounded-md">
            Enrolled
          </span>
        </div>

        {/* Real-Time Earnings & Cashout Card */}
        <div className="bg-white border border-slate-200 hover:border-[#E11D48]/40 transition-colors rounded-2xl p-4 card-shadow relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <h3 className="font-display font-bold text-xs text-slate-900">
              {t.total_reward}
            </h3>
            <span className="text-[11px] font-bold text-[#059669] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full whitespace-nowrap">
              Max ${targetPool.toFixed(2)} USDT
            </span>
          </div>

          {/* Dynamic Milestone Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline text-xs">
              <span className="text-slate-500 text-[11px] font-medium">
                {t.unlocked_balance}
              </span>
              <span className="font-bold text-slate-900 text-xs">
                $<span className="text-[#E11D48]">{earnedBalance.toFixed(2)}</span> / ${targetPool.toFixed(2)}{' '}
                <span className="text-slate-400 font-normal text-[11px]">({percent}%)</span>
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
              <div 
                className="h-full rounded-full gleam-bar transition-all duration-700 shadow-sm"
                style={{ width: `${percent}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-slate-500 pt-0.5 whitespace-nowrap">
              <span>Next: {isVideoApproved ? 'Complete views milestones' : (isTelegram ? 'Post on channel for +$3.00' : 'Submit video for +$10.00')}</span>
              <span className="text-[#E11D48] font-semibold">${remaining} Remaining</span>
            </div>
          </div>

          {/* Available Cashout & Button */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                {t.avail_withdraw}
              </span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className="text-lg font-extrabold text-slate-900 font-display">
                  ${earnedBalance.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">USDT</span>
              </div>
            </div>
            <button
              onClick={onOpenCashoutModal}
              className="px-5 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] active:scale-95 transition-all text-white font-bold text-xs rounded-xl shadow-md shadow-[#10B981]/25 flex items-center justify-center cursor-pointer"
            >
              {t.btn_cashout}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Creator Tasks Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 card-shadow">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center space-x-2">
            <h4 className="font-display font-bold text-xs text-slate-900">
              {t.tasks_header}
            </h4>
            <span className="text-[10px] font-bold text-[#059669] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              ${targetPool.toFixed(2)} USDT Pool
            </span>
          </div>
          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            Step 1 of 3
          </span>
        </div>

        <div className="space-y-2.5">
          {/* TASK 1: Register as Creator */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="flex items-center space-x-1.5">
                <h5 className="text-xs font-semibold text-slate-900">
                  {t.task_reg_title}
                </h5>
                <span className="text-[10px] font-bold text-[#059669] bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                  {isTelegram ? '+$2.00' : '+$5.00'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {t.task_reg_desc}
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#059669] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              {t.btn_completed}
            </span>
          </div>

          {/* TASK 2: Post on Channel (Video for YouTube / Post for Telegram) */}
          <div className="flex flex-col p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2" id="taskVideoCard">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <h5 className="text-xs font-semibold text-slate-900">
                    {isTelegram ? 'Post on Telegram Channel' : t.task_video_title}
                  </h5>
                  <span className="text-[10px] font-bold text-[#E11D48] bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                    {isTelegram ? '+$3.00' : '+$10.00'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isTelegram ? 'Post with AppleFarm & include referral link' : t.task_video_desc}
                </p>
              </div>

              {isVideoApproved ? (
                <span className="text-[11px] font-bold text-[#059669] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  {t.btn_completed}
                </span>
              ) : isVideoUnderReview ? (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                  {t.btn_under_review}
                </span>
              ) : (
                <button
                  onClick={handleToggleVideoVerify}
                  className="text-[11px] font-bold text-white bg-[#E11D48] hover:bg-[#BE123C] active:scale-95 transition-all px-3 py-1 rounded-lg flex items-center justify-center shadow-sm cursor-pointer"
                >
                  {isVideoVerifyOpen ? 'Cancel' : t.btn_verify}
                </button>
              )}
            </div>

            {/* Collapsible URL Submission Input */}
            {isVideoVerifyOpen && !isVideoApproved && !isVideoUnderReview && (
              <div className="pt-2 border-t border-slate-200 space-y-2" id="taskVerifyBox">
                <div className="relative">
                  <input
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    type="url"
                    placeholder={isTelegram ? "Paste TG post link (t.me/...)" : "Paste YouTube video link..."}
                    className="w-full bg-white border border-slate-300 focus:border-[#E11D48] text-slate-800 text-xs px-3 py-1.5 rounded-lg outline-none pr-16 shadow-inner"
                  />
                  <button
                    onClick={handleConfirmVideoSubmit}
                    disabled={submittingVideo}
                    className="absolute right-1 top-1 bottom-1 px-2.5 bg-[#10B981] hover:bg-[#059669] disabled:bg-slate-300 disabled:text-slate-500 text-white text-[11px] font-bold rounded-md cursor-pointer flex items-center gap-1"
                  >
                    {submittingVideo ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin text-[10px]"></i>
                        <span>Checking</span>
                      </>
                    ) : (
                      'Confirm'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* TASK 3: Views Milestone Dropdown Task */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 overflow-hidden transition-all">
            <div 
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-100/60 transition-colors"
              onClick={() => setIsMilestoneDropdownOpen(!isMilestoneDropdownOpen)}
            >
              <div>
                <div className="flex items-center space-x-1.5">
                  <h5 className="text-xs font-semibold text-slate-900">
                    {isTelegram ? 'Channel Post Views Milestone' : t.task_views_title}
                  </h5>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                    {isTelegram ? '+$5.00 Pool' : '+$10.00 Pool'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isTelegram ? '500, 1k & 2k views targets' : '1k, 2k & 3.9k views targets'}
                </p>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                  Progress
                </span>
                <span 
                  className={`text-xs text-slate-400 transform transition-transform duration-200 ${isMilestoneDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                >
                  ▼
                </span>
              </div>
            </div>

            {/* Dropdown Items with Claim Buttons */}
            {isMilestoneDropdownOpen && (
              <div className="border-t border-slate-200 bg-white p-3 space-y-2.5" id="viewsMilestoneContent">
                {tiers.map((tier) => (
                  <div key={tier.key} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-xs text-slate-900">{tier.label}</span>
                          <span className="text-[10px] font-bold text-[#059669] bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                            +${tier.amount.toFixed(2)} USDT
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{tier.hint}</span>
                      </div>
                      {renderTierButton(tier.key, tier.amount)}
                    </div>
                    {milestoneInputsOpen[tier.key] && (
                      <div className="pt-2 border-t border-slate-200 space-y-1.5">
                        <div className="relative">
                          <input
                            value={milestoneUrls[tier.key]}
                            onChange={(e) => setMilestoneUrls(prev => ({ ...prev, [tier.key]: e.target.value }))}
                            placeholder={`Paste ${tier.label} post/video link...`}
                            type="url"
                            className="w-full bg-white border border-slate-300 focus:border-[#E11D48] text-slate-800 text-xs px-3 py-1.5 rounded-lg outline-none pr-16"
                          />
                          <button
                            onClick={() => handleMilestoneSubmit(tier.key, tier.amount)}
                            disabled={submittingTier[tier.key]}
                            className="absolute right-1 top-1 bottom-1 px-2.5 bg-[#10B981] hover:bg-[#059669] disabled:bg-slate-300 disabled:text-slate-500 text-white text-[11px] font-bold rounded-md cursor-pointer flex items-center gap-1"
                          >
                            {submittingTier[tier.key] ? (
                              <>
                                <i className="fa-solid fa-spinner fa-spin text-[10px]"></i>
                                <span>Checking</span>
                              </>
                            ) : (
                              'Submit'
                            )}
                          </button>
                        </div>

                        {/* Live Tracking Result Feedback */}
                        {milestoneCheckResults[tier.key] && (
                          <div className={`p-2.5 rounded-xl border text-xs animate-pop ${
                            milestoneCheckResults[tier.key].success 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                              : 'bg-amber-50 border-amber-200 text-amber-900'
                          }`}>
                            <div className="flex items-center justify-between font-bold mb-1">
                              <span className="truncate pr-2">{milestoneCheckResults[tier.key].title || 'Tracked Target'}</span>
                              <span className="shrink-0 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200/60 text-[11px]">
                                {milestoneCheckResults[tier.key].viewCount?.toLocaleString() || 0} Views
                              </span>
                            </div>

                            {milestoneCheckResults[tier.key].notReached && (
                              <div className="space-y-1 mt-1.5">
                                <div className="w-full bg-amber-200/80 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                                    style={{ 
                                      width: `${Math.min(100, Math.round(((milestoneCheckResults[tier.key].viewCount || 0) / (milestoneCheckResults[tier.key].requiredViews || 1)) * 100))}%` 
                                    }}
                                  ></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-amber-700 font-medium pt-0.5">
                                  <span>Current: {(milestoneCheckResults[tier.key].viewCount || 0).toLocaleString()} views</span>
                                  <span>Target: {(milestoneCheckResults[tier.key].requiredViews || 1).toLocaleString()} views</span>
                                </div>
                                <p className="text-[10px] text-amber-800 font-semibold pt-0.5">
                                  {milestoneCheckResults[tier.key].message}
                                </p>
                              </div>
                            )}

                            {milestoneCheckResults[tier.key].success && (
                              <p className="text-[10px] text-emerald-700 font-semibold">
                                ✓ {milestoneCheckResults[tier.key].message}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Locked / Dynamic Referral Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 card-shadow relative overflow-hidden">
        {/* Lock Overlay */}
        {!isVideoApproved && (
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-3 text-center transition-all duration-300">
            <div className="bg-white px-3 py-1.5 rounded-full shadow-md border border-slate-200 flex items-center space-x-1.5">
              <span className="text-xs">🔒</span>
              <span className="text-[11px] font-bold text-slate-700">
                {isTelegram ? 'Locked: Complete TG Post Task to Unlock' : 'Locked: Complete Video Task to Unlock'}
              </span>
            </div>
          </div>
        )}

        <div className={`space-y-2.5 transition-all ${!isVideoApproved ? 'opacity-50' : 'opacity-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <i className="fa-solid fa-link text-[#E11D48] text-xs"></i>
              <span className="text-xs font-bold text-slate-900">
                {t.ref_title}
              </span>
            </div>
            <span className="text-[10px] text-slate-500">Tracked in Telegram</span>
          </div>

          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1.5 pl-3">
            <span className={`text-xs font-mono truncate flex-1 select-all ${isVideoApproved ? 'text-slate-700' : 'text-slate-500'}`}>
              {referralLink}
            </span>
            <button
              onClick={() => onCopyReferral(referralLink)}
              disabled={!isVideoApproved}
              className={`px-3.5 py-1.5 font-bold text-xs rounded-lg shrink-0 ml-2 shadow-sm transition-all ${
                isVideoApproved 
                  ? 'bg-[#E11D48] hover:bg-[#BE123C] active:scale-95 text-white cursor-pointer' 
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              {t.btn_copy}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 px-1">
            <span><i className="fa-solid fa-chart-line text-[#10B981] mr-1"></i> Conversion: <strong className="text-slate-700">24.2%</strong></span>
            <span><i className="fa-solid fa-hand-holding-dollar text-amber-500 mr-1"></i> Lifetime Payout: <strong className="text-slate-700">${targetPool.toFixed(2)}</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
}
