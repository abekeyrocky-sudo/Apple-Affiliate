import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import verifyChannelHandler from './api/verify-channel.js';
import verifyTaskHandler from './api/verify-task.js';

// Vite middleware plugin to emulate Vercel Serverless Functions in local dev
function vercelApiDevPlugin() {
  return {
    name: 'vercel-api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const isChannelVerify = req.url?.startsWith('/api/verify-channel') && req.method === 'POST';
        const isTaskVerify = req.url?.startsWith('/api/verify-task') && req.method === 'POST';

        if (isChannelVerify || isTaskVerify) {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              req.body = body ? JSON.parse(body) : {};
              const mockRes = {
                status(code) {
                  res.statusCode = code;
                  return this;
                },
                json(data) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return this;
                }
              };

              if (isChannelVerify) {
                await verifyChannelHandler(req, mockRes);
              } else {
                await verifyTaskHandler(req, mockRes);
              }
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, message: err.message }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env.YOUTUBE_API_KEY = env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY;
  process.env.TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;

  return {
    plugins: [react(), vercelApiDevPlugin()],
    server: {
      port: 5173,
      open: false
    }
  };
});
