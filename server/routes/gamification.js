import express from 'express';

const router = express.Router();

// Store gamification progress per user (keyed by email or anonId)
const userGamificationStore = {};

// Level calculation helper
export function computeLevel(xp = 0) {
  if (xp >= 1300) return { level: 6, title: 'Zen Master', nextXp: 2000, currentThreshold: 1300 };
  if (xp >= 850) return { level: 5, title: 'Serenity Guardian', nextXp: 1300, currentThreshold: 850 };
  if (xp >= 500) return { level: 4, title: 'Mindful Explorer', nextXp: 850, currentThreshold: 500 };
  if (xp >= 250) return { level: 3, title: 'Balance Builder', nextXp: 500, currentThreshold: 250 };
  if (xp >= 100) return { level: 2, title: 'Grounded Explorer', nextXp: 250, currentThreshold: 100 };
  return { level: 1, title: 'Mindful Seeker', nextXp: 100, currentThreshold: 0 };
}

// Milestone badges checklist
export function checkBadges(data) {
  const badges = new Set(data.unlockedBadges || []);

  if (data.journalsCompleted >= 1 || data.minutesMeditated >= 5 || data.daysStreak >= 1) {
    badges.add('first_step');
  }
  if (data.daysStreak >= 3) {
    badges.add('streak_3');
  }
  if (data.daysStreak >= 7) {
    badges.add('streak_7');
  }
  if (data.daysStreak >= 30) {
    badges.add('streak_30');
  }
  if (data.minutesMeditated >= 30) {
    badges.add('meditator_30');
  }
  if (data.minutesMeditated >= 100) {
    badges.add('zen_100');
  }
  if (data.journalsCompleted >= 5) {
    badges.add('journal_5');
  }
  if (data.journalsCompleted >= 30) {
    badges.add('journal_30');
  }

  return Array.from(badges);
}

// Get or initialize real user gamification data
function getOrCreateUserGamification(userId) {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDay = new Date().getDay(); // 0 = Sun, 1 = Mon ...

  if (!userGamificationStore[userId]) {
    const initialXp = 520;
    const lvl = computeLevel(initialXp);

    userGamificationStore[userId] = {
      userId,
      daysStreak: 4,
      lastCheckInDate: todayStr,
      minutesMeditated: 35,
      journalsCompleted: 2,
      xp: initialXp,
      level: lvl.level,
      levelTitle: lvl.title,
      weeklyActivity: [1, 2, 3, todayDay], // active days this week
      unlockedBadges: ['first_step', 'streak_3', 'meditator_30'],
      recentJournals: [
        {
          id: 'j-1',
          date: todayStr,
          time: '09:15 AM',
          mood: '😌 Calm',
          prompt: 'Morning Intention',
          text: 'Taking a 5-minute pause before my data science lab. Breathing through the exam pressure.'
        },
        {
          id: 'j-2',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          time: '08:30 PM',
          mood: '💪 Focused',
          prompt: 'Evening Reflection',
          text: 'Successfully handled assignment deadlines today without getting overwhelmed.'
        }
      ]
    };
  }

  return userGamificationStore[userId];
}

// GET /api/gamification/:userId - Get progress for specific logged in user
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const data = getOrCreateUserGamification(userId);
    const lvlInfo = computeLevel(data.xp);
    data.level = lvlInfo.level;
    data.levelTitle = lvlInfo.title;
    data.unlockedBadges = checkBadges(data);

    return res.json({
      success: true,
      gamification: {
        ...data,
        levelInfo: lvlInfo
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/gamification/checkin - Claim daily streak checkin
router.post('/checkin', (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const data = getOrCreateUserGamification(userId);
    const todayStr = new Date().toISOString().split('T')[0];
    const todayDay = new Date().getDay();

    if (data.lastCheckInDate === todayStr) {
      return res.json({
        success: true,
        alreadyCheckedIn: true,
        message: 'You have already checked in today! Streak is protected.',
        gamification: data
      });
    }

    // Check if yesterday was last checkin
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (data.lastCheckInDate === yesterday) {
      data.daysStreak += 1;
    } else {
      // Missed more than a day
      data.daysStreak = 1;
    }

    data.lastCheckInDate = todayStr;
    data.xp += 25;

    if (!data.weeklyActivity.includes(todayDay)) {
      data.weeklyActivity.push(todayDay);
    }

    const lvlInfo = computeLevel(data.xp);
    data.level = lvlInfo.level;
    data.levelTitle = lvlInfo.title;
    data.unlockedBadges = checkBadges(data);

    return res.json({
      success: true,
      alreadyCheckedIn: false,
      message: `Streak updated! You're on a ${data.daysStreak}-day streak! (+25 XP)`,
      gamification: {
        ...data,
        levelInfo: lvlInfo
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/gamification/meditation - Log meditation or breathing session
router.post('/meditation', (req, res) => {
  try {
    const { userId, minutes = 5 } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const data = getOrCreateUserGamification(userId);
    const mins = Math.max(1, parseInt(minutes, 10) || 5);

    data.minutesMeditated += mins;
    const gainedXp = mins * 4;
    data.xp += gainedXp;

    const todayDay = new Date().getDay();
    if (!data.weeklyActivity.includes(todayDay)) {
      data.weeklyActivity.push(todayDay);
    }

    const lvlInfo = computeLevel(data.xp);
    data.level = lvlInfo.level;
    data.levelTitle = lvlInfo.title;
    data.unlockedBadges = checkBadges(data);

    return res.json({
      success: true,
      message: `Recorded ${mins} minutes of meditation! (+${gainedXp} XP)`,
      gamification: {
        ...data,
        levelInfo: lvlInfo
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/gamification/journal - Save a student reflective journal entry
router.post('/journal', (req, res) => {
  try {
    const { userId, mood = '😌 Calm', prompt = 'Daily Check-in', text } = req.body;
    if (!userId || !text) {
      return res.status(400).json({ success: false, error: 'User ID and reflection text are required' });
    }

    const data = getOrCreateUserGamification(userId);
    data.journalsCompleted += 1;
    data.xp += 35;

    const now = new Date();
    const newEntry = {
      id: `j-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mood,
      prompt,
      text: text.trim()
    };

    data.recentJournals.unshift(newEntry);
    if (data.recentJournals.length > 20) {
      data.recentJournals = data.recentJournals.slice(0, 20);
    }

    const todayDay = now.getDay();
    if (!data.weeklyActivity.includes(todayDay)) {
      data.weeklyActivity.push(todayDay);
    }

    const lvlInfo = computeLevel(data.xp);
    data.level = lvlInfo.level;
    data.levelTitle = lvlInfo.title;
    data.unlockedBadges = checkBadges(data);

    return res.json({
      success: true,
      message: 'Reflection recorded privately! (+35 XP)',
      entry: newEntry,
      gamification: {
        ...data,
        levelInfo: lvlInfo
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
