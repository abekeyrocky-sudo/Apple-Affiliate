import React, { useState } from 'react';

const TRC20_REGEX = /^T[1-9A-HJ-NP-za-km-z]{33}$/;

export default function CashoutModal({ isOpen, onClose, earnedBalance, minCashoutAmount = 25.00, onSubmitCashout, t }) {
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const threshold = minCashoutAmount || 25.00;
  const currentEarned = earnedBalance || 0;
  const isEligible = currentEarned >= threshold;
  const percent = Math.min(Math.round((currentEarned / threshold) * 100), 100);
  const remaining = Math.max(0, threshold - currentEarned).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isEligible) {
      setError(`Minimum cashout threshold is $${threshold.toFixed(2)} USDT`);
      return;
    }

    const trimmed = walletAddress.trim();
    if (!TRC20_REGEX.test(trimmed)) {
      setError('Invalid TRC-20 address format. Must start with T and have 34 characters.');
      return;
    }

    setLoading(true);
    try {
      await onSubmitCashout(trimmed, threshold);
      setWalletAddress('');
    } catch (err) {
      setError(err.message || 'Cashout submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-200">
      <div className="w-full max-w-sm bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-pop relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center text-xs transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Clean Header */}
        <div className="mb-4">
          <h3 className="font-display font-extrabold text-base text-slate-900">
            {t.withdraw_modal_title}
          </h3>
          <p className="text-[11px] text-slate-500">TRC-20 Network</p>
        </div>

        {/* Minimal Balance & Threshold Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 space-y-1.5">
          <div className="flex justify-between items-baseline">
            <span className="text-[11px] text-slate-500 font-medium">Available Balance</span>
            <span className="text-base font-bold text-slate-900 font-display">
              <span>${currentEarned.toFixed(2)}</span>{' '}
              <span className="text-[11px] text-slate-400 font-normal">/ ${threshold.toFixed(2)}</span>
            </span>
          </div>
          
          {/* Mini Progress */}
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
            <span>Min. Payout: ${threshold.toFixed(2)}</span>
            <span className={`font-semibold ${isEligible ? 'text-emerald-600' : 'text-[#E11D48]'}`}>
              {isEligible ? 'Ready to withdraw' : `$${remaining} needed`}
            </span>
          </div>
        </div>

        {/* Wallet Address Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="trc20AddressInput">
              TRC-20 Wallet Address
            </label>
            <input
              id="trc20AddressInput"
              type="text"
              maxLength={34}
              required
              value={walletAddress}
              onChange={(e) => {
                setWalletAddress(e.target.value);
                if (error) setError('');
              }}
              placeholder="Paste address starting with T..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#10B981] focus:bg-white text-slate-900 text-xs px-3 py-2.5 rounded-xl font-mono outline-none transition-all shadow-inner"
            />
            <span className="text-[10px] text-slate-400 mt-1 block pl-0.5">
              Only Tron (TRC-20) network is supported.
            </span>
          </div>

          {error && (
            <div className="text-[11px] text-red-600 font-medium bg-red-50 p-2 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={!isEligible || loading}
            className={`w-full py-3 font-bold text-xs rounded-xl transition-all flex items-center justify-center ${
              isEligible
                ? 'bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] active:scale-[0.98] text-white shadow-md shadow-[#10B981]/25 cursor-pointer'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            {loading 
              ? 'Processing...' 
              : isEligible 
                ? `Withdraw $${threshold.toFixed(2)} USDT` 
                : `Need $${remaining} more to withdraw`}
          </button>
        </form>
      </div>
    </div>
  );
}
