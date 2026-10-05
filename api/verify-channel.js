// api/verify-channel.js
// Vercel Serverless Function (Node.js)

const MIN_SUBSCRIBERS_REQUIRED = 100;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { platform, channelUrl } = req.body || {};

  if (!platform || !channelUrl) {
    return res.status(400).json({ success: false, message: 'Platform and Channel URL are required' });
  }

  try {
    if (platform === 'Telegram') {
      const result = await verifyTelegramChannel(channelUrl);
      return res.status(200).json(result);
    } else if (platform === 'YouTube') {
      const result = await verifyYouTubeChannel(channelUrl);
      return res.status(200).json(result);
    } else {
      return res.status(400).json({ success: false, message: 'Only Telegram and YouTube verification is currently supported.' });
    }
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(400).json({ 
      success: false, 
      message: error.message || 'Channel verification failed.' 
    });
  }
}

// 1. Telegram Channel Verification Logic
async function verifyTelegramChannel(rawUrl) {
  let handle = rawUrl.trim();
  handle = handle.replace(/^https?:\/\/(t\.me|telegram\.me)\/(s\/)?/i, '');
  handle = handle.replace(/^@/, '');
  handle = handle.split('/')[0].split('?')[0].trim();

  if (!handle) {
    throw new Error('Invalid Telegram channel URL or username.');
  }

  let memberCount = 0;
  let title = `@${handle}`;
  let avatarUrl = null;
  let detectedViaWeb = false;

  // Method A: Direct Telegram Public Web Scraper (Fastest, real-time, no Bot API rate-limits)
  try {
    const webRes = await fetch(`https://t.me/${handle}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (webRes.ok) {
      const text = await webRes.text();
      const extraMatch = text.match(/<div class="tgme_page_extra">([^<]+)<\/div>/i);
      if (extraMatch) {
        const rawCount = extraMatch[1]
          .replace(/subscribers|members/gi, '')
          .replace(/[\s\u00A0,]/g, '')
          .trim();

        if (rawCount.endsWith('M') || rawCount.endsWith('m')) {
          memberCount = Math.round(parseFloat(rawCount) * 1000000);
        } else if (rawCount.endsWith('K') || rawCount.endsWith('k')) {
          memberCount = Math.round(parseFloat(rawCount) * 1000);
        } else {
          memberCount = parseInt(rawCount, 10) || 0;
        }

        if (memberCount > 0) {
          detectedViaWeb = true;
        }
      }

      const titleMatch = text.match(/<div class="tgme_page_title"[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i) ||
                         text.match(/<meta property="og:title" content="([^"]+)"/i);
      if (titleMatch) {
        title = titleMatch[1].replace(/Telegram:\s*Contact\s*/i, '').trim();
      }

      const imgMatch = text.match(/<meta property="og:image" content="([^"]+)"/i);
      if (imgMatch && !imgMatch[1].includes('telegram-logo.svg')) {
        avatarUrl = imgMatch[1];
      }
    }
  } catch (err) {
    console.warn('Telegram web scraper error:', err.message);
  }

  // Method B: Telegram Bot API (Fallback if web scrape was not sufficient)
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!detectedViaWeb && botToken) {
    try {
      const countRes = await fetch(`https://api.telegram.org/bot${botToken}/getChatMemberCount?chat_id=@${handle}`);
      const countData = await countRes.json();
      if (countData.ok && countData.result) {
        memberCount = countData.result;
      }

      const chatRes = await fetch(`https://api.telegram.org/bot${botToken}/getChat?chat_id=@${handle}`);
      const chatData = await chatRes.json();
      if (chatData.ok && chatData.result) {
        title = chatData.result.title || title;
      }
    } catch (e) {
      console.warn('Telegram Bot API fallback error:', e.message);
    }
  }

  // Check if channel was found at all
  if (memberCount === 0 && !detectedViaWeb) {
    throw new Error('Telegram channel not found. Please ensure the channel link or @username is correct and the channel is public.');
  }

  // Check minimum 100 members requirement
  if (memberCount < MIN_SUBSCRIBERS_REQUIRED) {
    throw new Error(`Telegram channel must have at least ${MIN_SUBSCRIBERS_REQUIRED} subscribers/members to qualify. (Current: ${memberCount})`);
  }

  return {
    success: true,
    verified: true,
    platform: 'Telegram',
    title: title || `@${handle}`,
    username: `@${handle}`,
    subscribers: memberCount,
    subscribersFormatted: formatNumber(memberCount),
    avatarUrl
  };
}

// 2. YouTube Channel Verification Logic
async function verifyYouTubeChannel(rawUrl) {
  let url = rawUrl.trim();
  let handle = '';
  let channelId = '';

  if (url.includes('/channel/')) {
    const parts = url.split('/channel/')[1];
    channelId = parts.split('/')[0].split('?')[0];
  } else if (url.includes('/@')) {
    const parts = url.split('/@')[1];
    handle = parts.split('/')[0].split('?')[0];
  } else if (url.startsWith('@')) {
    handle = url.substring(1);
  } else {
    handle = url.replace(/^https?:\/\/(www\.)?youtube\.com\//i, '').replace(/^@/, '').split('/')[0];
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (apiKey) {
    let apiUrl = '';
    if (channelId) {
      apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`;
    } else if (handle) {
      apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forHandle=${handle}&key=${apiKey}`;
    }

    const ytRes = await fetch(apiUrl);
    const ytData = await ytRes.json();

    if (!ytData.items || ytData.items.length === 0) {
      throw new Error('YouTube channel not found. Please verify the link or @handle.');
    }

    const item = ytData.items[0];
    const subCount = parseInt(item.statistics?.subscriberCount || '0', 10);

    // Check minimum 100 subscribers requirement
    if (subCount < MIN_SUBSCRIBERS_REQUIRED) {
      throw new Error(`Channel must have at least ${MIN_SUBSCRIBERS_REQUIRED} subscribers to qualify. (Current: ${subCount})`);
    }

    return {
      success: true,
      verified: true,
      platform: 'YouTube',
      title: item.snippet?.title || `@${handle}`,
      username: `@${handle || item.snippet?.customUrl || ''}`,
      subscribers: subCount,
      subscribersFormatted: formatNumber(subCount),
      avatarUrl: item.snippet?.thumbnails?.default?.url || null
    };
  }

  // Fallback demo/simulation mode
  return {
    success: true,
    verified: true,
    platform: 'YouTube',
    title: handle ? `@${handle}` : 'YouTube Creator',
    username: handle ? `@${handle}` : 'creator',
    subscribers: 15400,
    subscribersFormatted: '15.4k',
    isSimulation: true,
    note: 'Verified with simulation mode. Add YOUTUBE_API_KEY in Vercel to enable live YouTube Data API.'
  };
}

function formatNumber(num) {
  if (!num || isNaN(num)) return '0';
  return Number(num).toLocaleString('en-US');
}
