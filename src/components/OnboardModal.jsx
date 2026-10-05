import React, { useState } from 'react';

const MIN_REQUIRED_SUBSCRIBERS = 100;

const PLATFORMS = [
  { name: 'YouTube', icon: 'fa-brands fa-youtube', color: 'text-red-500', isLocked: false },
  { name: 'TikTok', icon: 'fa-brands fa-tiktok', color: 'text-slate-800', isLocked: true },
  { name: 'Telegram', icon: 'fa-brands fa-telegram', color: 'text-[#2AABEE]', isLocked: false },
  { name: 'Facebook', icon: 'fa-brands fa-facebook', color: 'text-blue-600', isLocked: true },
  { name: 'Website', icon: 'fa-solid fa-globe', color: 'text-emerald-600', isLocked: true },
  { name: 'Other', icon: 'fa-solid fa-ellipsis', color: 'text-purple-600', isLocked: true }
];

export default function OnboardModal({ isOpen, onClose, onSubmit }) {
  const [platform, setPlatform] = useState('Telegram');
  const [channelUrl, setChannelUrl] = useState('');
  const [followers, setFollowers] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifyError, setVerifyError] = useState('');

  if (!isOpen) return null;

  const handlePlatformChange = (newPlatform) => {
    setPlatform(newPlatform);
    setVerificationResult(null);
    setVerifyError('');
    setFollowers('');
    setChannelUrl('');
  };

  const handleVerifyChannel = async () => {
    if (!channelUrl.trim()) {
      setVerifyError('Please enter your channel link or username first.');
      return;
    }

    setVerifying(true);
    setVerifyError('');
    setVerificationResult(null);

    try {
      const response = await fetch('/api/verify-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          channelUrl: channelUrl.trim()
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Channel verification failed.');
      }

      // Check min 100 subscribers
      const subCount = Number(data.subscribers) || 0;
      if (subCount < MIN_REQUIRED_SUBSCRIBERS) {
        throw new Error(`Channel has ${subCount} subscribers. Minimum ${MIN_REQUIRED_SUBSCRIBERS} subscribers required to qualify.`);
      }

      setVerificationResult(data);
      setFollowers(data.subscribersFormatted || String(subCount));
    } catch (err) {
      console.error(err);
      setVerifyError(err.message || 'Could not verify channel. Check the link and try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!channelUrl.trim()) return;

    let verifiedData = verificationResult;

    // If user clicked submit directly without clicking verify first, run verification automatically
    if (!verifiedData) {
      setVerifying(true);
      try {
        const response = await fetch('/api/verify-channel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform,
            channelUrl: channelUrl.trim()
          })
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Channel verification failed.');
        }

        const subCount = Number(data.subscribers) || 0;
        if (subCount < MIN_REQUIRED_SUBSCRIBERS) {
          throw new Error(`Channel has ${subCount} subscribers. Minimum ${MIN_REQUIRED_SUBSCRIBERS} subscribers required to qualify.`);
        }

        verifiedData = data;
        setVerificationResult(data);
        setFollowers(data.subscribersFormatted || String(subCount));
      } catch (err) {
        setVerifyError(err.message || 'Channel verification failed.');
        setVerifying(false);
        return;
      } finally {
        setVerifying(false);
      }
    }

    setLoading(true);
    try {
      await onSubmit({ 
        platform, 
        channelUrl: channelUrl.trim(), 
        followers: verifiedData.subscribersFormatted || `${verifiedData.subscribers}`,
        channelTitle: verifiedData.title || ''
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholder = () => {
    if (platform === 'YouTube') return 'https://youtube.com/@yourchannel';
    return 'https://t.me/yourchannel';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-200">
      <div className="w-full max-w-md bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-pop relative max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Close icon */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs transition-colors cursor-pointer"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-[#E11D48] flex items-center justify-center text-lg shadow-sm">
            <i className="fa-solid fa-id-badge"></i>
          </div>
          <div>
            <h3 className="font-display font-extrabold text-base text-slate-900">
              Join Apple Farm Creator Program
            </h3>
            <p className="text-xs text-slate-500">Step 1 of 1: Connect your public channel</p>
          </div>
        </div>

        {/* 100 Subscribers Requirement Badge */}
        <div className="mb-4 p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center space-x-2 text-xs text-amber-800">
          <i className="fa-solid fa-circle-check text-amber-600 text-sm shrink-0"></i>
          <span className="font-medium">
            <strong>Eligibility:</strong> Minimum <strong>100 subscribers</strong> required for both Telegram &amp; YouTube.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Platform Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">
                Primary Content Platform <span className="text-[#E11D48]">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                Auto-verified via official API
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {PLATFORMS.map((p) => {
                const isSelected = platform === p.name;
                const isLocked = p.isLocked;

                if (isLocked) {
                  return (
                    <div
                      key={p.name}
                      title="Currently locked. Coming soon!"
                      className="relative p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-center flex flex-col items-center justify-center opacity-45 cursor-not-allowed select-none"
                    >
                      <span className="absolute top-1.5 right-1.5 text-[8px] bg-slate-200 text-slate-600 px-1 py-0.2 rounded-full font-bold flex items-center gap-0.5">
                        <i className="fa-solid fa-lock text-[7px]"></i>
                      </span>
                      <i className={`${p.icon} text-slate-400 text-lg mb-1`}></i>
                      <span className="text-[11px] font-medium text-slate-500">
                        {p.name}
                      </span>
                    </div>
                  );
                }

                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handlePlatformChange(p.name)}
                    className={`relative p-2.5 rounded-xl transition-all text-center flex flex-col items-center justify-center shadow-sm cursor-pointer ${
                      isSelected
                        ? 'border-2 border-[#E11D48] bg-rose-50/80 active:scale-95 shadow-rose-100'
                        : 'border border-slate-200 bg-slate-50 hover:border-[#E11D48]/60 active:scale-95'
                    }`}
                  >
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <i className={`${p.icon} ${p.color} text-lg mb-1`}></i>
                    <span className={`text-[11px] ${isSelected ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                      {p.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Channel URL & Auto Verify Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700" htmlFor="channelUrlInput">
                Channel URL ({platform}) <span className="text-[#E11D48]">*</span>
              </label>
              {verificationResult && (
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <i className="fa-solid fa-circle-check"></i> 100+ Verified
                </span>
              )}
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">
                <i className="fa-solid fa-link"></i>
              </span>
              <input
                id="channelUrlInput"
                type="text"
                required
                value={channelUrl}
                onChange={(e) => {
                  setChannelUrl(e.target.value);
                  setVerificationResult(null);
                  setVerifyError('');
                  setFollowers('');
                }}
                placeholder={getPlaceholder()}
                className={`w-full bg-slate-50 border text-slate-800 text-xs pl-8 pr-20 py-2.5 rounded-xl outline-none transition-colors ${
                  verificationResult 
                    ? 'border-emerald-400 bg-emerald-50/30' 
                    : 'border-slate-200 focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]'
                }`}
              />
              <button
                type="button"
                onClick={handleVerifyChannel}
                disabled={verifying || !channelUrl.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#E11D48] hover:bg-[#BE123C] disabled:bg-slate-200 disabled:text-slate-400 active:scale-95 text-white font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                {verifying ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin text-[10px]"></i>
                    <span>Checking</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-bolt text-[9px]"></i>
                    <span>Verify</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {verifyError && (
              <p className="text-[11px] text-red-600 mt-1.5 bg-red-50 p-2.5 rounded-xl border border-red-200 flex items-start gap-1.5 animate-pop">
                <i className="fa-solid fa-circle-exclamation mt-0.5 shrink-0"></i>
                <span>{verifyError}</span>
              </p>
            )}

            {/* Success Result Card */}
            {verificationResult && (
              <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs animate-pop">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <div>
                    <h6 className="font-bold text-slate-900 leading-tight">
                      {verificationResult.title}
                    </h6>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      {verificationResult.subscribersFormatted} Subscribers (Eligible ✓)
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-white border border-emerald-200 text-emerald-600 px-2 py-0.5 rounded-full font-bold">
                  Verified
                </span>
              </div>
            )}
          </div>

          {/* 3. Follower Count (Locked & Auto-populated from API) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700" htmlFor="followerCountInput">
                Subscriber / Member Count <span className="text-[#E11D48]">*</span>
              </label>
              <span className="text-[10px] text-slate-400">Min 100</span>
            </div>
            
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">
                <i className="fa-solid fa-users"></i>
              </span>
              <input
                id="followerCountInput"
                type="text"
                readOnly
                required
                value={verificationResult ? `${verificationResult.subscribersFormatted} subscribers (Official API ✓)` : ''}
                placeholder="Click 'Verify' above to auto-detect subscribers"
                className={`w-full border text-xs pl-8 pr-3 py-2.5 rounded-xl outline-none select-none cursor-not-allowed ${
                  verificationResult 
                    ? 'bg-emerald-50/50 border-emerald-300 text-emerald-900 font-semibold' 
                    : 'bg-slate-100 border-slate-200 text-slate-500'
                }`}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block pl-0.5">
              {verificationResult 
                ? '✓ Count verified directly from official API' 
                : '🔒 Locked: Auto-detected via API to prevent fake follower counts.'}
            </span>
          </div>

          {/* Terms agreement notice */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-start space-x-2">
            <i className="fa-solid fa-shield-halved text-[#E11D48] mt-0.5 text-xs shrink-0"></i>
            <span>Channels with 100+ members gain instant access to Telegram referral tracking and USDT TRC-20 cashout pools.</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || verifying}
            className="w-full py-3.5 bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:from-[#BE123C] hover:to-[#9F1239] active:scale-[0.98] transition-all text-white font-bold text-sm rounded-xl shadow-md shadow-[#E11D48]/25 flex items-center justify-center cursor-pointer disabled:opacity-75"
          >
            {loading ? "Completing Registration..." : (verifying ? "Verifying Channel..." : "Complete Creator Registration")}
          </button>
        </form>
      </div>
    </div>
  );
}
