import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readCliFlag(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && idx + 1 < process.argv.length) {
    return process.argv[idx + 1];
  }
  const eqPrefix = `${flag}=`;
  const match = process.argv.find((a) => a.startsWith(eqPrefix));
  return match ? match.slice(eqPrefix.length) : undefined;
}

const PORT = Number(readCliFlag('--port') || process.env.PORT || 3000);
const HOST = readCliFlag('--host') || process.env.HOST || '0.0.0.0';
const AUDIO_DIR = path.resolve(__dirname, 'public', 'audio', 'brownie');
const MANIFEST_PATH = path.resolve(AUDIO_DIR, 'manifest.json');

const ALLOWED_SLOTS = new Set([
  'demand_meow',
  'chirp_ekekek',
  'greeting_trill',
  'purr_loop',
  'grumpy_mumble',
  'zoomies_yowl',
]);

const ALLOWED_EXTENSIONS = new Set(['wav', 'mp3', 'webm', 'ogg', 'm4a']);
const MAX_AUDIO_BYTES = 6 * 1024 * 1024; // 6 MB cap

export interface BrownieAudioClip {
  id: string;
  slot: string;
  label: string;
  url: string;
  fileName: string;
  trimStart: number;
  trimEnd: number | null;
  createdAt: string;
}

type AudioManifest = Record<string, BrownieAudioClip[]>;

function ensureAudioStorage() {
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }
  if (!fs.existsSync(MANIFEST_PATH)) {
    const empty: AudioManifest = {};
    for (const slot of ALLOWED_SLOTS) {
      empty[slot] = [];
    }
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(empty, null, 2), 'utf8');
  }
}

function readManifest(): AudioManifest {
  ensureAudioStorage();
  try {
    const raw = fs.readFileSync(MANIFEST_PATH, 'utf8');
    const parsed = JSON.parse(raw) as AudioManifest;
    const normalized: AudioManifest = {};
    for (const slot of ALLOWED_SLOTS) {
      normalized[slot] = Array.isArray(parsed[slot]) ? parsed[slot] : [];
    }
    return normalized;
  } catch {
    const empty: AudioManifest = {};
    for (const slot of ALLOWED_SLOTS) {
      empty[slot] = [];
    }
    return empty;
  }
}

function writeManifest(manifest: AudioManifest) {
  ensureAudioStorage();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
}

function resolveSafeAudioFile(fileName: string): string | null {
  const baseName = path.basename(fileName);
  if (!/^[a-zA-Z0-9_-]+\.(wav|mp3|webm|ogg|m4a)$/.test(baseName)) {
    return null;
  }
  const resolved = path.resolve(AUDIO_DIR, baseName);
  if (!resolved.startsWith(AUDIO_DIR + path.sep)) {
    return null;
  }
  return resolved;
}

async function startServer() {
  ensureAudioStorage();

  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Serve persisted Brownie audio clips cleanly in both dev & prod
  app.use('/audio/brownie', express.static(AUDIO_DIR));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/brownie-audio', (_req, res) => {
    const manifest = readManifest();
    res.json({ manifest });
  });

  app.post('/api/brownie-audio/upload', (req, res) => {
    try {
      const { slot, label, ext, dataBase64, trimStart, trimEnd } = req.body ?? {};

      if (typeof slot !== 'string' || !ALLOWED_SLOTS.has(slot)) {
        res.status(400).json({ error: 'Invalid Brownie audio slot.' });
        return;
      }

      const cleanExt = typeof ext === 'string' ? ext.toLowerCase().replace(/[^a-z0-9]/g, '') : 'webm';
      if (!ALLOWED_EXTENSIONS.has(cleanExt)) {
        res.status(400).json({ error: 'Unsupported audio file format.' });
        return;
      }

      if (typeof dataBase64 !== 'string' || dataBase64.length === 0) {
        res.status(400).json({ error: 'Audio data is required.' });
        return;
      }

      const strippedBase64 = dataBase64.replace(/^data:audio\/[a-zA-Z0-9.+-]+;base64,/, '');
      const buffer = Buffer.from(strippedBase64, 'base64');
      if (buffer.length === 0 || buffer.length > MAX_AUDIO_BYTES) {
        res.status(400).json({ error: 'Audio clip must be between 1 byte and 6 MB.' });
        return;
      }

      const id = `${slot}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const fileName = `${id}.${cleanExt}`;
      const safePath = resolveSafeAudioFile(fileName);
      if (!safePath) {
        res.status(400).json({ error: 'Invalid generated filename.' });
        return;
      }

      fs.writeFileSync(safePath, buffer);

      const safeLabel =
        typeof label === 'string' && label.trim().length > 0
          ? label.trim().slice(0, 60)
          : `${slot.replace('_', ' ')} clip`;

      const startSec = typeof trimStart === 'number' && Number.isFinite(trimStart) && trimStart >= 0 ? trimStart : 0;
      const endSec =
        typeof trimEnd === 'number' && Number.isFinite(trimEnd) && trimEnd > startSec ? trimEnd : null;

      const clip: BrownieAudioClip = {
        id,
        slot,
        label: safeLabel,
        url: `/audio/brownie/${fileName}`,
        fileName,
        trimStart: startSec,
        trimEnd: endSec,
        createdAt: new Date().toISOString(),
      };

      const manifest = readManifest();
      manifest[slot].push(clip);
      writeManifest(manifest);

      res.status(201).json({ clip, manifest });
    } catch (err) {
      console.error('Error saving Brownie audio:', err);
      res.status(500).json({ error: 'Failed to save audio clip.' });
    }
  });

  app.patch('/api/brownie-audio/:slot/:id', (req, res) => {
    const { slot, id } = req.params;
    if (!ALLOWED_SLOTS.has(slot)) {
      res.status(400).json({ error: 'Invalid audio slot.' });
      return;
    }

    const manifest = readManifest();
    const clip = manifest[slot].find((c) => c.id === id);
    if (!clip) {
      res.status(404).json({ error: 'Audio clip not found.' });
      return;
    }

    const { trimStart, trimEnd, label } = req.body ?? {};
    if (typeof trimStart === 'number' && Number.isFinite(trimStart) && trimStart >= 0) {
      clip.trimStart = trimStart;
    }
    if (trimEnd === null || (typeof trimEnd === 'number' && Number.isFinite(trimEnd) && trimEnd > clip.trimStart)) {
      clip.trimEnd = trimEnd;
    }
    if (typeof label === 'string' && label.trim().length > 0) {
      clip.label = label.trim().slice(0, 60);
    }

    writeManifest(manifest);
    res.json({ clip, manifest });
  });

  app.delete('/api/brownie-audio/:slot/:id', (req, res) => {
    const { slot, id } = req.params;
    if (!ALLOWED_SLOTS.has(slot)) {
      res.status(400).json({ error: 'Invalid audio slot.' });
      return;
    }

    const manifest = readManifest();
    const idx = manifest[slot].findIndex((c) => c.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Audio clip not found.' });
      return;
    }

    const [removed] = manifest[slot].splice(idx, 1);
    const safePath = resolveSafeAudioFile(removed.fileName);
    if (safePath && fs.existsSync(safePath)) {
      fs.unlinkSync(safePath);
    }

    writeManifest(manifest);
    res.json({ manifest });
  });

  // Bind listening port immediately so startup healthchecks succeed without waiting on Vite warmup
  let viteReady: Promise<void> | null = null;
  let viteMiddlewares: express.RequestHandler | null = null;

  if (process.env.NODE_ENV !== 'production') {
    viteReady = (async () => {
      try {
        const { createServer: createViteServer } = await import('vite');
        const vite = await createViteServer({
          server: { middlewareMode: true, hmr: false, ws: false },
          appType: 'spa',
        });
        viteMiddlewares = vite.middlewares;
      } catch (err) {
        console.error('Failed to initialize Vite dev middleware:', err);
        throw err;
      }
    })();
    app.use(async (req, res, next) => {
      try {
        if (!viteMiddlewares && viteReady) {
          await viteReady;
        }
        if (viteMiddlewares) {
          return viteMiddlewares(req, res, next);
        }
        next();
      } catch (err) {
        next(err);
      }
    });
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`Brownie server listening on http://${HOST}:${PORT}`);
  });
  server.on('error', (err) => {
    console.error('Server listen error:', err);
    process.exit(1);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
