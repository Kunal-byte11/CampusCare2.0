import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.js';
import bookingsRouter, { seedCounselorAccount } from './routes/bookings.js';
import gamificationRouter from './routes/gamification.js';
import { checkSupabaseHealth, isSupabaseConfigured } from './config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/gamification', gamificationRouter);

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
