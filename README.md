# CampusCare – Student Mental Wellness & Support Platform

![CampusCare Favicon](public/favicon.svg)

> **CampusCare** is a fullstack, confidential student mental wellness platform designed to provide accessible, empathetic, and comprehensive mental health resources for college students and counselors.

---

## 🌟 Key Features

- **📅 Confidential Counselor Booking**: Schedule 1-on-1 virtual or in-person sessions with licensed campus psychologists and peer counselors.
- **🤖 24/7 AI Mental Health Chatbot**: Instant, empathetic conversational support with crisis de-escalation protocols and calming exercises.
- **🎮 Gamified Habit & Wellness Tracking**: Daily mood check-ins, water intake, mindfulness streaks, and wellness badges to build healthy routines.
- **💬 Anonymous Peer Support Community**: Safe, moderated student forum to discuss stress, academic pressure, and life challenges without judgment.
- **📚 Curated Mental Health Resources**: Self-care guides, breathing exercises, crisis hotlines, and psychoeducational materials.
- **🚨 24/7 Emergency SOS & Crisis Bar**: Immediate one-tap access to national and campus crisis helplines, suicide prevention hotlines, and emergency responders.
- **🔒 Role-Based Access Control**: Tailored dashboards for Students, Counselors, and Administrators with protected routes.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Vanilla CSS Design Token System (`tokens.css` with Dark & Light theme support)
- **Icons**: Lucide React Icons
- **State Management**: React Context (`AuthContext`)

### Backend & Database
- **Runtime**: Node.js & Express.js
- **Database & Auth**: [Supabase](https://supabase.com) (PostgreSQL) with Row-Level Security (RLS)
- **Security**: JWT authentication, hashed passwords, encrypted session notes

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### 2. Clone the Repository
```bash
git clone https://github.com/SHIV-LAB-cloud/CampusCare.git
cd CampusCare
```

### 3. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..
```

### 4. Configure Environment Variables

1. **Frontend**: Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Supabase configuration:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Backend**: Copy `server/.env.example` to `server/.env`:
   ```bash
   cp server/.env.example server/.env
   ```
   Configure your Supabase Service Role and JWT secret:
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### 5. Setup Database
Run the SQL migration in `database/supabase_schema.sql` in your Supabase SQL Editor to set up all tables, indexes, and sample counselors.

### 6. Run the Application
```bash
# Run both Frontend and Backend concurrently
npm run dev
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 📁 Project Structure

```
CampusCare/
├── database/
│   └── supabase_schema.sql    # Database schema & seed data
├── public/
│   └── favicon.svg            # CampusCare brand favicon
├── server/
│   ├── config/supabase.js     # Supabase client config
│   ├── routes/                # Express API routes
│   └── index.js               # Backend entrypoint
├── src/
│   ├── components/            # Reusable UI components
│   ├── context/               # AuthContext & state
│   ├── pages/                 # Route pages (Home, Booking, Chatbot, Forum, etc.)
│   ├── styles/tokens.css      # Core design system tokens
│   ├── App.jsx                # Main route configuration
│   ├── main.jsx               # React DOM entrypoint
│   └── index.css              # Global styles
├── .env.example               # Frontend environment template
├── .gitignore                 # Git ignore rules
├── index.html                 # Main HTML template
├── package.json               # Dependencies and scripts
└── vite.config.js             # Vite configuration
```

---

## 🔒 Security & Privacy

CampusCare adheres to strict privacy principles:
- No personal identifiers are shared in the anonymous forum.
- Confidential counselor session notes are restricted via access controls.
- All secrets and `.env` files are excluded from version control.

---

## 📄 License
This project is licensed under the MIT License.
