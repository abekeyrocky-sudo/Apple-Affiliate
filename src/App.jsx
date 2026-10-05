import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import OnboardingBanner from './components/OnboardingBanner';
import Dashboard from './components/Dashboard';
import TrustSection from './components/TrustSection';
import LangModal from './components/LangModal';
import OnboardModal from './components/OnboardModal';
import CashoutModal from './components/CashoutModal';
import Toast from './components/Toast';

import { 
  getTelegramUser, 
  listenToUserProfile, 
  registerCreator, 
  submitVideoPostVerification, 
  saveMilestoneClaimToFirebase, 
  submitCashoutRequest 
} from './services/firebase';

import { TRANSLATIONS } from './constants/translations';

const KEY_LANG = 'apple_farm_lang';

export default function App() {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem(KEY_LANG) || localStorage.getItem('mango_affiliate_lang') || 'en';
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isCashoutModalOpen, setIsCashoutModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast dispatch
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initialize Telegram & User
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }

    const user = getTelegramUser();
    setCurrentUser(user);

    // Prompt language selection if first time
    if (!localStorage.getItem(KEY_LANG)) {
      const timer = setTimeout(() => {
        setIsLangModalOpen(true);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen to Firestore User Profile in real-time
  useEffect(() => {
    if (!currentUser?.id) return;

    const unsubscribe = listenToUserProfile(currentUser.id, (data) => {
      setUserData(data);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [currentUser?.id]);

  // Current translation strings
  const t = useMemo(() => {
    return TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  }, [currentLang]);

  // Language Change
  const handleSelectLang = (langCode, langItem) => {
    setCurrentLang(langCode);
    localStorage.setItem(KEY_LANG, langCode);
    setIsLangModalOpen(false);
    showToast(`Language changed to ${langItem.name}`, 'success');
  };

  const isTelegram = userData?.platform === 'Telegram';
  const maxReward = isTelegram ? 10.00 : 25.00;

  // Calculate dynamic earned balance based on platform
  const earnedBalance = useMemo(() => {
    if (!userData || !userData.isJoined) return 0;
    
    if (userData.platform === 'Telegram') {
      let earned = 2.00; // Base registration for Telegram
      if (userData.tasks?.video_post?.status === 'approved' || userData.taskVideoStatus === 'approved') {
        earned += 3.00; // TG Channel Post
      }
      if (userData.tasks?.['1k']?.status === 'approved') earned += 1.00;
      if (userData.tasks?.['2k']?.status === 'approved') earned += 2.00;
      if (userData.tasks?.['3k']?.status === 'approved') earned += 2.00;
      return Math.min(earned, 10.00);
    } else {
      let earned = 5.00; // Base registration for YouTube
      if (userData.tasks?.video_post?.status === 'approved' || userData.taskVideoStatus === 'approved') {
        earned += 10.00; // YouTube Video Post
      }
      if (userData.tasks?.['1k']?.status === 'approved') earned += 2.00;
      if (userData.tasks?.['2k']?.status === 'approved') earned += 3.00;
      if (userData.tasks?.['3k']?.status === 'approved') earned += 5.00;
      return Math.min(earned, 25.00);
    }
  }, [userData]);

  // Handle Onboarding Registration
  const handleOnboardSubmit = async (creatorInfo) => {
    try {
      const registered = await registerCreator(creatorInfo);
      setUserData(registered);
      setIsOnboardModalOpen(false);
      showToast('Registration complete & verified!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to register. Please try again.', 'error');
    }
  };

  // Handle Video / Channel Post Verification Link Submission
  const handleVerifyVideo = async (videoUrl) => {
    try {
      showToast('Verifying post with API...', 'info');
      const res = await fetch('/api/verify-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: userData?.platform || 'Telegram',
          type: 'post',
          targetUrl: videoUrl
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Verification failed. Please check the post/video link.');
      }

      // Auto approve on valid check
      await submitVideoPostVerification(videoUrl, true);
      const addedAmount = (userData?.platform === 'Telegram') ? '3.00' : '10.00';
      showToast(`✓ Post Verified! +$${addedAmount} USDT added to your balance!`, 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Verification failed.', 'error');
      throw err;
    }
  };

  // Handle Milestone Submission with Real-time Views Verification
  const handleSubmitMilestone = async (tier, amount, videoUrl) => {
    try {
      showToast('Checking live views with API...', 'info');

      // Determine required views for the tier
      let targetViews = 1000;
      if (userData?.platform === 'Telegram') {
        if (tier === '1k') targetViews = 500;
        else if (tier === '2k') targetViews = 1000;
        else if (tier === '3k') targetViews = 2000;
      } else {
        if (tier === '1k') targetViews = 1000;
        else if (tier === '2k') targetViews = 2000;
        else if (tier === '3k') targetViews = 3900;
      }

      const res = await fetch('/api/verify-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: userData?.platform || 'YouTube',
          type: 'milestone',
          targetUrl: videoUrl,
          targetViews: targetViews
        })
      });

      const data = await res.json();

      if (data.notReached) {
        showToast(`Tracked: ${data.viewCount?.toLocaleString() || 0} views. Need ${data.remainingViews?.toLocaleString() || 0} more views!`, 'info');
        return data;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Milestone verification failed.');
      }

      // Auto approve milestone claim
      await saveMilestoneClaimToFirebase({ 
        tier, 
        amount, 
        videoUrl, 
        viewCount: data.viewCount 
      }, true);

      showToast(`✓ Milestone Claimed! Verified ${data.viewCount?.toLocaleString() || targetViews} views. +$${amount.toFixed(2)} USDT added!`, 'success');
      return data;
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Milestone verification failed.', 'error');
      throw err;
    }
  };

  // Handle Cashout Request
  const handleCashoutSubmit = async (walletAddress, amount) => {
    try {
      await submitCashoutRequest(walletAddress, amount);
      setIsCashoutModalOpen(false);
      showToast(`Withdrawal of $${amount.toFixed(2)} USDT submitted successfully!`, 'success');
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Handle Referral Link Copy
  const handleCopyReferral = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Referral link copied to clipboard!', 'success');
      }).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Referral link copied to clipboard!', 'success');
    } catch (err) {
      showToast('Failed to copy. Please copy manually.', 'error');
    }
    document.body.removeChild(textArea);
  };

  const isEnrolled = Boolean(userData && userData.isJoined);

  return (
    <div className="min-h-screen flex justify-center items-start antialiased text-slate-700 bg-slate-100/80">
      {/* Mobile Viewport Container (Telegram TWA Container) */}
      <div 
        id="appContainer"
        className="w-full max-w-[480px] min-h-screen bg-white border-x border-slate-200/90 shadow-2xl relative flex flex-col pb-10"
      >
        <Header 
          currentLang={currentLang} 
          onOpenLangModal={() => setIsLangModalOpen(true)} 
          t={t} 
        />

        <main className="flex-1 px-4 pt-4 space-y-4">
          <Hero t={t} />

          {!isEnrolled ? (
            <OnboardingBanner 
              onOpenOnboardModal={() => setIsOnboardModalOpen(true)} 
              t={t} 
            />
          ) : (
            <Dashboard 
              userData={userData}
              currentUser={currentUser}
              earnedBalance={earnedBalance}
              maxReward={maxReward}
              onOpenCashoutModal={() => setIsCashoutModalOpen(true)}
              onVerifyVideo={handleVerifyVideo}
              onSubmitMilestone={handleSubmitMilestone}
              onCopyReferral={handleCopyReferral}
              t={t}
            />
          )}

          <TrustSection />
        </main>
      </div>

      {/* Modals & Toasts */}
      <LangModal 
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        onSelectLang={handleSelectLang}
        t={t}
      />

      <OnboardModal 
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
        onSubmit={handleOnboardSubmit}
      />

      <CashoutModal 
        isOpen={isCashoutModalOpen}
        onClose={() => setIsCashoutModalOpen(false)}
        earnedBalance={earnedBalance}
        minCashoutAmount={maxReward}
        onSubmitCashout={handleCashoutSubmit}
        t={t}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
