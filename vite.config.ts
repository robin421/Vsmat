import { defineConfig, type Plugin, type ResolvedConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createRequire } from 'module';

/**
 * Fills in the service worker's precache list and cache version after the
 * build, so the hashed JS/CSS entry files are available offline from the first
 * visit and every deploy gets its own cache name.
 */
function swManifest(): Plugin {
  let config: ResolvedConfig;
  return {
    name: 'vsmat-sw-manifest',
    apply: 'build',
    configResolved(c) {
      config = c;
    },
    closeBundle() {
      const outDir = path.resolve(config.root, config.build.outDir);
      const swPath = path.join(outDir, 'sw.js');
      if (!fs.existsSync(swPath)) return;

      const assetsDir = path.join(outDir, 'assets');
      const built = fs.existsSync(assetsDir)
        ? fs.readdirSync(assetsDir).filter((f) => /\.(js|css)$/.test(f)).sort().map((f) => `/assets/${f}`)
        : [];
      const shell = [
        '/',
        '/index.html',
        '/manifest.webmanifest',
        '/icon.svg',
        '/icon-192.png',
        '/icon-512.png',
        '/apple-touch-icon.png',
        '/favicon.png',
      ];
      const precache = [...shell, ...built];
      const version = crypto.createHash('sha256').update(precache.join('\n')).digest('hex').slice(0, 10);

      const src = fs.readFileSync(swPath, 'utf8');
      fs.writeFileSync(
        swPath,
        src
          .replace("'__VSMAT_PRECACHE__'", JSON.stringify(precache))
          .replace("'__VSMAT_VERSION__'", JSON.stringify(version))
      );
    },
  };
}


/**
 * Serves/emits the Tesseract worker + WASM core from our own origin so OCR
 * never has to reach a CDN (keeps the "fully offline" promise and lets the CSP
 * stay `connect-src 'self'`). Only the LSTM variants that tesseract.js picks
 * by default are shipped.
 */
function ocrAssets(): Plugin {
  const require = createRequire(import.meta.url);
  const coreDir = path.dirname(require.resolve('tesseract.js-core/package.json'));
  const workerFile = path.join(path.dirname(require.resolve('tesseract.js/package.json')), 'dist', 'worker.min.js');
  const files: Record<string, string> = {
    'worker.min.js': workerFile,
    'tesseract-core-lstm.wasm.js': path.join(coreDir, 'tesseract-core-lstm.wasm.js'),
    'tesseract-core-simd-lstm.wasm.js': path.join(coreDir, 'tesseract-core-simd-lstm.wasm.js'),
    'tesseract-core-relaxedsimd-lstm.wasm.js': path.join(coreDir, 'tesseract-core-relaxedsimd-lstm.wasm.js'),
  };
  return {
    name: 'vsmat-ocr-assets',
    configureServer(server) {
      server.middlewares.use('/tesseract', (req, res, next) => {
        const name = decodeURIComponent((req.url || '').split('?')[0].replace(/^\//, ''));
        const file = files[name];
        if (!file) return next();
        res.setHeader('Content-Type', 'text/javascript');
        fs.createReadStream(file).pipe(res);
      });
    },
    generateBundle() {
      for (const [name, file] of Object.entries(files)) {
        this.emitFile({ type: 'asset', fileName: `tesseract/${name}`, source: fs.readFileSync(file) });
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), ocrAssets(), swManifest()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Never inline fonts as data: URIs; the CSP only allows `font-src 'self'`.
    assetsInlineLimit: (file) => (file.endsWith('.woff2') ? false : undefined),
  },
  server: {
    port: 5173,
    host: true,
  },
});
