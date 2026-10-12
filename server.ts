import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import { app } from './server/app';
import { getAdminSecretPath, createAdminSessionToken } from './server/adminAuth';

const PORT = 3000;
const HOST = '0.0.0.0';
const isDev = process.env.NODE_ENV !== 'production';

async function startServer() {
  const secretPath = getAdminSecretPath();
  console.log(`[Tatari Server] Admin Secret Portal Route initialized at configured path: ${secretPath}`);

  let vite: any = null;
  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: { middlewareMode: true, host: HOST, port: PORT },
      appType: 'spa',
    });
  }

  // Intercept the Secret Admin URL (with and without trailing slash)
  const secretRoutes = [secretPath, `${secretPath.replace(/\/+$/, '')}/`];
  app.get(secretRoutes, async (req, res) => {
    const token = createAdminSessionToken();
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    res.cookie('tatari_adm_token', token, {
      path: '/',
      httpOnly: false,
      sameSite: 'none',
      secure: true,
      maxAge: 7 * 24 * 3600 * 1000,
    });

    try {
      let html = '';
      if (isDev && vite) {
        let template = fs.readFileSync(path.resolve('index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        html = template;
      } else {
        html = fs.readFileSync(path.resolve('dist', 'index.html'), 'utf-8');
      }

      // Inject noindex and administrative context bootstrap into head
      const adminInjection = `
    <!-- Secret Admin Portal Context - Never expose on public pages -->
    <meta name="robots" content="noindex, nofollow, noarchive" />
    <script>
      window.__TATARI_ADMIN_BOOTSTRAP__ = {
        authorized: true,
        token: "${token}",
        secretPath: "${secretPath}"
      };
    </script>
      `;
      html = html.replace('</head>', `${adminInjection}\n</head>`);

      res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
    } catch (err: any) {
      console.error('[Secret Route] Failed to serve admin bootstrap:', err);
      res.status(500).send('Internal Server Error');
    }
  });

  // Serve static files or Vite middlewares
  if (isDev && vite) {
    app.use(vite.middlewares);
  } else {
    app.use(expressStaticDist());
  }

  function expressStaticDist() {
    const router = express.Router();
    router.use(express.static(path.resolve('dist')));
    router.get('*', (_req: any, res: any) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
    return router;
  }

  app.listen(PORT, HOST, () => {
    console.log(`[Tatari Server] Listening on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Tatari Server] Failed to start:', err);
  process.exit(1);
});
