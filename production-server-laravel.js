/**
 * Language Academy — Production Server (Laravel Backend)
 * Single Node.js process serves all SPA portals + Next.js website
 * API requests are proxied to Laravel (php artisan serve)
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// ─── DEBUG LOG ──────────────────────────────────────────────────────────────
const LOG_FILE = path.join(__dirname, 'startup-debug.log');
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch (e) { /* ignore */ }
}
try { fs.writeFileSync(LOG_FILE, ''); } catch (e) { /* ignore */ }

log('═══ PRODUCTION SERVER (LARAVEL) STARTING ═══');
log(`__dirname: ${__dirname}`);
log(`cwd: ${process.cwd()}`);
log(`Node version: ${process.version}`);

// ─── Capture Hostinger's PORT before dotenv can override ────────────────────
const HOSTINGER_PORT = process.env.PORT;

// ─── Global error handlers ─────────────────────────────────────────────────
process.on('uncaughtException', (err) => {
  log(`UNCAUGHT EXCEPTION: ${err.stack || err.message || err}`);
});
process.on('unhandledRejection', (err) => {
  log(`UNHANDLED REJECTION: ${err && err.stack ? err.stack : err}`);
});

// ─── Step 1: Config ────────────────────────────────────────────────────────
log('STEP 1: Loading config...');
process.env.TZ = 'Asia/Dhaka';
const PORT = HOSTINGER_PORT || process.env.PORT || 3000;
const LARAVEL_PORT = process.env.LARAVEL_PORT || 8000;
process.env.PORT = String(PORT);
log(`  Main server PORT: ${PORT}`);
log(`  Laravel API PORT: ${LARAVEL_PORT}`);
log('STEP 1: Done');

// ─── Step 2: Load express ──────────────────────────────────────────────────
log('STEP 2: Loading express...');
let express, compression, cors, cookieParser;
try {
  express = require('express');
  compression = require('compression');
  cors = require('cors');
  cookieParser = require('cookie-parser');
  log(`  Express version: ${require('express/package.json').version}`);
} catch (err) {
  log(`  FATAL: Cannot load express: ${err.message}`);
  process.exit(1);
}

let createProxyMiddleware;
try {
  createProxyMiddleware = require('http-proxy-middleware').createProxyMiddleware;
  log('  http-proxy-middleware loaded');
} catch (err) {
  log(`  FATAL: Cannot load http-proxy-middleware: ${err.message}`);
  log('  Run: npm install http-proxy-middleware');
  process.exit(1);
}
log('STEP 2: Done');

// ─── Step 3: Load Next.js ──────────────────────────────────────────────────
log('STEP 3: Loading Next.js...');
let next, nextApp, nextHandle;
const websiteDir = path.join(__dirname, 'website');
const nextDir = path.join(websiteDir, '.next');
log(`  website dir exists: ${fs.existsSync(websiteDir)}`);
log(`  .next dir exists: ${fs.existsSync(nextDir)}`);
try {
  next = require(path.join(websiteDir, 'node_modules', 'next'));
  nextApp = next({
    dev: false,
    dir: websiteDir,
    conf: { skipTrailingSlashRedirect: true },
  });
  nextHandle = nextApp.getRequestHandler();
  log('  Next.js app created');
} catch (err) {
  log(`  FATAL: Cannot load Next.js: ${err.stack || err.message}`);
  process.exit(1);
}
log('STEP 3: Done');

// ─── Boot ───────────────────────────────────────────────────────────────────
async function start() {
  // Step 4: Start Laravel
  log('STEP 4: Starting Laravel backend...');
  const laravelDir = path.join(__dirname, 'backend-laravel');
  const phpPath = 'php'; // assumes php is in PATH

  const laravelProcess = spawn(phpPath, [
    'artisan', 'serve',
    `--port=${LARAVEL_PORT}`,
    '--host=127.0.0.1',
  ], {
    cwd: laravelDir,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  laravelProcess.stdout.on('data', (data) => {
    log(`  [Laravel] ${data.toString().trim()}`);
  });
  laravelProcess.stderr.on('data', (data) => {
    log(`  [Laravel ERR] ${data.toString().trim()}`);
  });
  laravelProcess.on('error', (err) => {
    log(`  FATAL: Cannot start Laravel: ${err.message}`);
  });
  laravelProcess.on('exit', (code) => {
    log(`  [Laravel] Process exited with code ${code}`);
  });

  // Graceful shutdown
  process.on('SIGINT', () => { laravelProcess.kill(); process.exit(0); });
  process.on('SIGTERM', () => { laravelProcess.kill(); process.exit(0); });

  // Wait a moment for Laravel to start
  await new Promise(r => setTimeout(r, 3000));
  log('STEP 4: Done — Laravel started');

  // Step 5: Prepare Next.js
  log('STEP 5: Preparing Next.js...');
  try {
    await nextApp.prepare();
    log('STEP 5: Done — Next.js ready');
  } catch (err) {
    log(`STEP 5 FAILED: ${err.stack || err.message}`);
    process.exit(1);
  }

  // Step 6: Create Express app and mount routes
  log('STEP 6: Mounting routes...');
  const app = express();
  app.use(compression());
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(cookieParser());

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), port: PORT, backend: 'laravel' });
  });

  // ─── Proxy API to Laravel ────────────────────────────────────────────────
  const laravelProxy = createProxyMiddleware({
    target: `http://127.0.0.1:${LARAVEL_PORT}`,
    changeOrigin: true,
  });

  app.use('/api', laravelProxy);
  log('  ✓ /api → Laravel proxy');

  // ─── Proxy uploads to Laravel (storage) ──────────────────────────────────
  const uploadsDir = path.join(__dirname, 'backend-laravel', 'storage', 'app', 'public', 'uploads');
  const oldUploadsDir = path.join(__dirname, 'backend', 'uploads');
  const publicImageCache = 'public, max-age=86400, stale-while-revalidate=604800';

  // Try serving uploads from Laravel storage first, then fallback to old backend/uploads
  if (fs.existsSync(uploadsDir)) {
    app.use('/uploads', express.static(uploadsDir, {
      setHeaders: (res, filePath) => {
        if (/\.(?:avif|webp|png|jpe?g|svg|ico)$/i.test(filePath)) {
          res.set('Cache-Control', publicImageCache);
        }
      },
    }));
    log(`  ✓ /uploads → ${uploadsDir}`);
  }
  if (fs.existsSync(oldUploadsDir)) {
    app.use('/uploads', express.static(oldUploadsDir, {
      setHeaders: (res, filePath) => {
        if (/\.(?:avif|webp|png|jpe?g|svg|ico)$/i.test(filePath)) {
          res.set('Cache-Control', publicImageCache);
        }
      },
    }));
    log(`  ✓ /uploads fallback → ${oldUploadsDir}`);
  }

  // Also proxy /storage to Laravel for any storage links
  app.use('/storage', createProxyMiddleware({
    target: `http://127.0.0.1:${LARAVEL_PORT}`,
    changeOrigin: true,
  }));
  log('  ✓ /storage → Laravel proxy');

  // ─── Static website public ───────────────────────────────────────────────
  const websitePublicDir = path.join(__dirname, 'website', 'public');
  app.use(express.static(websitePublicDir, {
    index: false,
    setHeaders: (res, filePath) => {
      if (/\.(?:avif|webp|png|jpe?g|svg|ico)$/i.test(filePath)) {
        res.set('Cache-Control', publicImageCache);
      }
    },
  }));

  // Fallback image handlers
  const sendMissingUploadFallback = (fallbackFile) => (req, res, next) => {
    const fallbackPath = path.join(websitePublicDir, fallbackFile);
    if (!fs.existsSync(fallbackPath)) return next();
    res.set('Cache-Control', publicImageCache);
    return res.sendFile(fallbackPath);
  };
  app.get('/uploads/blogs/{*splat}', sendMissingUploadFallback('blog_resources.webp'));
  app.get('/uploads/courses/{*splat}', sendMissingUploadFallback('pte_course.webp'));
  app.get('/uploads/branches/{*splat}', sendMissingUploadFallback('hero_banner.webp'));

  // ─── MIME types ──────────────────────────────────────────────────────────
  const MIME_MAP = {
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.json': 'application/json',
    '.webp': 'image/webp',
    '.map': 'application/json',
  };
  const staticAssetCache = 'public, max-age=31536000, immutable';

  // ─── SPA Portals ─────────────────────────────────────────────────────────
  const sendSpaIndex = (indexFile) => (req, res) => {
    if (path.extname(req.path)) {
      return res.status(404).type('text/plain').send('Asset not found');
    }
    res.set('Cache-Control', 'no-store');
    res.sendFile(indexFile);
  };

  // Admin Portal
  const adminDist = path.join(__dirname, 'admin-portal', 'dist');
  const adminIndex = path.join(adminDist, 'index.html');
  if (fs.existsSync(adminIndex)) {
    app.use('/admin/assets', (req, res, next) => {
      const assetPath = path.join(adminDist, 'assets', req.path.substring(1));
      const ext = path.extname(assetPath).toLowerCase();
      if (fs.existsSync(assetPath)) {
        const mime = MIME_MAP[ext] || 'application/octet-stream';
        res.set('Content-Type', mime);
        res.set('Cache-Control', staticAssetCache);
        return res.sendFile(assetPath);
      }
      return res.status(404).type('text/plain').send('Asset not found');
    });
    app.use('/admin', express.static(adminDist, { index: false }));
    app.get('/admin/{*splat}', sendSpaIndex(adminIndex));
    log('  ✓ /admin → admin-portal/dist');
  }

  // Student Portal
  const studentDist = path.join(__dirname, 'student-portal', 'dist');
  const studentIndex = path.join(studentDist, 'index.html');
  if (fs.existsSync(studentIndex)) {
    app.use('/student', express.static(studentDist, { index: false }));
    app.get('/student/{*splat}', sendSpaIndex(studentIndex));
    log('  ✓ /student → student-portal/dist');
  }

  // Other portals
  const portalMounts = [
    ['/teacher', 'teacher-portal'],
    ['/accounting', 'accounting-portal'],
    ['/hrm', 'hr-portal'],
    ['/brandmanager', 'crm-portal'],
  ];

  for (const [mountPath, dirName] of portalMounts) {
    const distDir = path.join(__dirname, dirName, 'dist');
    const indexFile = path.join(distDir, 'index.html');
    if (fs.existsSync(indexFile)) {
      app.use(mountPath, express.static(distDir, { index: false }));
      app.get(`${mountPath}/{*splat}`, sendSpaIndex(indexFile));
      log(`  ✓ ${mountPath} → ${dirName}/dist`);
    } else {
      log(`  ✘ ${mountPath} skipped (no build found)`);
    }
  }

  // ─── Next.js catch-all ───────────────────────────────────────────────────
  app.all('{*splat}', (req, res) => {
    return nextHandle(req, res);
  });

  log('STEP 6: Done — all routes mounted');

  // Step 7: Listen
  log(`STEP 7: Starting HTTP server on port ${PORT}...`);
  app.listen(PORT, '0.0.0.0', () => {
    log(`STEP 7: Done — Server LISTENING on 0.0.0.0:${PORT}`);
    log('═══ PRODUCTION SERVER (LARAVEL) READY ═══');
    console.log(`\n  ╔══════════════════════════════════════════╗`);
    console.log(`  ║  Language Academy · Laravel · :${PORT}       ║`);
    console.log(`  ╠══════════════════════════════════════════╣`);
    console.log(`  ║  Website  → localhost:${PORT}               ║`);
    console.log(`  ║  Admin    → localhost:${PORT}/admin         ║`);
    console.log(`  ║  Student  → localhost:${PORT}/student       ║`);
    console.log(`  ║  Teacher  → localhost:${PORT}/teacher       ║`);
    console.log(`  ║  HRM      → localhost:${PORT}/hrm           ║`);
    console.log(`  ║  Accounts → localhost:${PORT}/accounting    ║`);
    console.log(`  ║  CRM      → localhost:${PORT}/brandmanager  ║`);
    console.log(`  ║  API      → localhost:${PORT}/api (Laravel) ║`);
    console.log(`  ╚══════════════════════════════════════════╝\n`);
  });
}

start().catch(err => {
  log(`FATAL STARTUP ERROR: ${err.stack || err.message}`);
  process.exit(1);
});
