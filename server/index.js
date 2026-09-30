import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.js';
import bookingsRouter, { seedCounselorAccount } from './routes/bookings.js';
import gamificationRouter from './routes/gamification.js';
import agoraRouter from './routes/agora.js';
import forumRouter from './routes/forum.js';
import chatRouter from './routes/chat.js';
import assessmentsRouter from './routes/assessments.js';
import { checkSupabaseHealth, isSupabaseConfigured } from './config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    // Allow localhost, vercel.app preview domains, and configured CLIENT_URL
    const isVercel = /\.vercel\.app$/.test(origin);
    const isLocal = /localhost/.test(origin);
    const isClientUrl = process.env.CLIENT_URL && origin.startsWith(process.env.CLIENT_URL);
    if (isVercel || isLocal || isClientUrl || !process.env.CLIENT_URL) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive default to avoid deployment blocker
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/gamification', gamificationRouter);
app.use('/api/agora', agoraRouter);
app.use('/api/forum', forumRouter);
app.use('/api/chat', chatRouter);
app.use('/api/assessments', assessmentsRouter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const supabaseHealth = await checkSupabaseHealth();
  return res.json({
    status: isSupabaseConfigured ? 'healthy' : 'ready_for_supabase',
    database: isSupabaseConfigured ? 'supabase_cloud' : 'dev_mode',
    supabase: supabaseHealth,
    serverTime: new Date().toISOString()
  });
});

// Root check
app.get('/', (req, res) => {
  res.json({
    message: 'CampusCare Backend API (Supabase Integration) is running.',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        googleSync: 'POST /api/auth/google-sync',
        me: 'GET /api/auth/me'
      },
      bookings: {
        create: 'POST /api/bookings',
        list: 'GET /api/bookings',
        stats: 'GET /api/bookings/stats',
        updateStatus: 'PATCH /api/bookings/:id/status',
        updateNotes: 'PATCH /api/bookings/:id/notes'
      },
      agora: {
        config: 'GET /api/agora/config',
        token: 'POST /api/agora/token',
        createCall: 'POST /api/agora/create-call',
        joinCall: 'PATCH /api/agora/call/:channelName/join',
        endCall: 'PATCH /api/agora/call/:channelName/end',
        getCalls: 'GET /api/agora/calls/:anonId'
      },
      forum: {
        listPosts: 'GET /api/forum/posts',
        getPost: 'GET /api/forum/posts/:id',
        createPost: 'POST /api/forum/posts',
        addComment: 'POST /api/forum/posts/:id/comments',
        toggleLike: 'POST /api/forum/posts/:id/like',
        deletePost: 'DELETE /api/forum/posts/:id'
      }
    }
  });
});

// Start server
async function startServer() {
  app.listen(PORT, async () => {
    console.log(` CampusCare Backend Server running on http://localhost:${PORT}`);
    console.log(` Health check available at http://localhost:${PORT}/api/health`);
    if (!isSupabaseConfigured) {
      console.log(` [NOTE] Supabase credentials pending in server/.env. Add SUPABASE_URL and SUPABASE_ANON_KEY to enable live cloud sync.`);
    } else {
      console.log(` Supabase integration active.`);
      // Auto-seed Ms. Shahista Kazi counselor account
      await seedCounselorAccount();
    }
  });
}

startServer();

export default app;
