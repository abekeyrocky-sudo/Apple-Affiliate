// src/utils/telegram.js
export const SUPPORT_BOT_URL = 'https://t.me/AppleFarm_Support_bot';

export const openTelegramLink = (url = SUPPORT_BOT_URL) => {
  try {
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(url);
      return;
    }
  } catch (e) {
    console.warn('Telegram WebApp openTelegramLink failed, falling back to window.open:', e);
  }
  window.open(url, '_blank', 'noopener,noreferrer');
};
