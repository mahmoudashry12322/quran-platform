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

// Reciters Directory API Endpoint
app.get('/api/quran/reciters', (req, res) => {
  res.json({
    reciters: [
      { id: 'ar.abdulrahmanmossad', name: 'الشيخ عبد الرحمن مسعد', englishName: 'Abdul Rahman Mossad', style: 'تلاوات خاشعة' },
      { id: 'ar.sherifmostafa', name: 'الشيخ شريف مصطفى', englishName: 'Sherif Mostafa', style: 'تلاوات خاشعة' },
      { id: 'ar.alafasy', name: 'الشيخ مشاري راشد العفاسي', englishName: 'Mishary Rashid Alafasy', style: 'مرتل' },
      { id: 'ar.ajmi', name: 'الشيخ أحمد بن علي العجمي', englishName: 'Ahmed Ibn Ali Al-Ajamy', style: 'مرتل' },
      { id: 'ar.abdulbasitmurattal', name: 'الشيخ عبد الباسط عبد الصمد', englishName: 'Abdul Basit Abdul Samad', style: 'مرتل' },
      { id: 'ar.minshawi', name: 'الشيخ محمد صديق المنشاوي', englishName: 'Mohamed Siddiq El-Minshawi', style: 'مرتل' },
      { id: 'ar.husary', name: 'الشيخ محمود خليل الحصري', englishName: 'Mahmoud Khalil Al-Husary', style: 'مرتل' },
      { id: 'ar.sudais', name: 'الشيخ عبد الرحمن السديس', englishName: 'Abderrahman Al-Sudais', style: 'مرتل' },
      { id: 'ar.shuraim', name: 'الشيخ سعود الشريم', englishName: 'Saoud Al-Shuraim', style: 'مرتل' },
      { id: 'ar.mahermuaiqly', name: 'الشيخ ماهر المعيقلي', englishName: 'Maher Al-Muaiqly', style: 'مرتل' },
      { id: 'ar.yasserallahtheem', name: 'الشيخ ياسر الدوسري', englishName: 'Yasser Al-Dosari', style: 'مرتل' },
      { id: 'ar.ghamadi', name: 'الشيخ سعد الغامدي', englishName: 'Saad Al-Ghamdi', style: 'مرتل' },
      { id: 'ar.shatri', name: 'الشيخ أبو بكر الشاطري', englishName: 'Abu Bakr Al-Shatri', style: 'مرتل' },
      { id: 'ar.qatami', name: 'الشيخ ناصر القطامي', englishName: 'Nasser Al-Qatami', style: 'مرتل' },
      { id: 'ar.abkar', name: 'الشيخ إدريس أبكر', englishName: 'Idrees Abkar', style: 'مرتل' },
      { id: 'ar.abbad', name: 'الشيخ فارس عباد', englishName: 'Fares Abbad', style: 'مرتل' },
      { id: 'ar.jaleel', name: 'الشيخ خالد الجليل', englishName: 'Khalid Al-Jaleel', style: 'مرتل' },
      { id: 'ar.mustafa', name: 'الشيخ مصطفى إسماعيل', englishName: 'Mustafa Ismail', style: 'مجود' },
      { id: 'ar.banna', name: 'الشيخ محمود علي البنا', englishName: 'Mahmoud Ali Al-Banna', style: 'مرتل' },
      { id: 'ar.huthifi', name: 'الشيخ علي بن عبد الرحمن الحذيفي', englishName: 'Ali Ibn Abderrahman Al-Huthaify', style: 'مرتل' },
      { id: 'ar.juhany', name: 'الشيخ عبد الله الجهني', englishName: 'Abdullah Awad Al-Juhany', style: 'مرتل' },
      { id: 'ar.ayyoub', name: 'الشيخ محمد أيوب', englishName: 'Muhammad Ayyoub', style: 'مرتل' }
    ]
  });
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

// Serve public audio directory directly
const publicAudioPath = path.resolve(process.cwd(), 'public/audio');
app.use('/audio', express.static(publicAudioPath));

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
