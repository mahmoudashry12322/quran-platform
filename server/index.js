import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security & Middleware
app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://quran.mahmoudashry.site'],
    credentials: true
  })
);

// Simple In-Memory Cache store
const cache = new Map();

const getCachedOrFetch = async (key, ttlMs, fetchFn) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return cached.data;
  }
  const freshData = await fetchFn();
  cache.set(key, { data: freshData, timestamp: Date.now() });
  return freshData;
};

// Health Check API Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'quran-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Surah Directory API Cache Proxy Endpoint
app.get('/api/quran/surahs', async (req, res) => {
  try {
    const data = await getCachedOrFetch('surahs_list', 86400000, async () => {
      const response = await fetch('https://api.alquran.cloud/v1/surah');
      return await response.json();
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch surah list' });
  }
});

// Admin System Monitoring & Stats API Endpoint
app.get('/api/admin/stats', (req, res) => {
  res.json({
    platformName: 'منصة القرآن الكريم',
    domain: 'quran.mahmoudashry.site',
    recitersCount: 10,
    cachedRequestsCount: cache.size,
    serverMemoryUsage: process.memoryUsage(),
    status: 'healthy'
  });
});

// Serve frontend static assets if built
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

// Fallback middleware to serve React SPA frontend for non-API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});



app.listen(PORT, '127.0.0.1', () => {
  console.log(`Quran Express server running securely on http://127.0.0.1:${PORT}`);
});
