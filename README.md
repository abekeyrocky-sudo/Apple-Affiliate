# Apple Farm Creator Affiliate Program (TMA)

An affiliate platform and Telegram Mini App (TMA) for creators across **YouTube** and **Telegram**, featuring automatic channel verification, milestone tracking, and USDT TRC-20 cashout pools.

## 🚀 Features

- **Multi-Platform Support**:
  - **YouTube Creators**: Up to **$25.00 USDT** reward pool. Minimum 100 subscribers required.
  - **Telegram Creators**: Up to **$10.00 USDT** reward pool. Minimum 100 subscribers/members required.
- **Automated Verification**:
  - Live YouTube Data API v3 verification for channel ownership, subscriber counts, and video view milestones.
  - Live Telegram Bot API verification for public channels and member counts, with automated post views tracking.
- **Secure Architecture**:
  - API keys and bot tokens are strictly isolated in serverless backend functions (`/api`). No secret credentials in the client build.
- **Built for Telegram Mini Apps**:
  - Responsive design optimized for TMA viewports and web browsers.
  - Multi-language support (English, Bengali, Hindi, Arabic, Spanish, Russian).
  - Firebase Firestore for creator data, tasks, and withdrawal requests.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v3
- **Backend / Serverless**: Node.js Serverless Functions (`/api`)
- **Database**: Firebase Firestore
- **Deployment**: Vercel ready (`vercel.json`)

## ⚙️ Environment Variables

Create a `.env` file in the root directory (never commit this file):

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
YOUTUBE_API_KEY=your_youtube_data_api_v3_key
```

## 📦 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```
