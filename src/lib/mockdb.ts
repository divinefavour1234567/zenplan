import fs from 'fs';
import path from 'path';
import { Habit, Profile } from './types';

const DB_FILE = path.join(process.cwd(), '.zenplan-db.json');

const DEFAULT_PROFILE: Profile = {
  name: 'Zen Developer',
  email: 'zen@hackathon.com',
  isPremium: false,
  premiumSince: null,
};

interface DbData {
  habits: Habit[];
  profile: Profile;
}

async function readDb(): Promise<DbData> {
  // 1. Try to read from cookies (resilient session fallback for Vercel/serverless)
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const dataStr = cookieStore.get('zenplan_db')?.value;
    if (dataStr) {
      return JSON.parse(decodeURIComponent(dataStr));
    }
  } catch (error) {
    // cookies() not available (e.g. static generation or outside request context)
  }

  // 2. Fallback to local file system
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData: DbData = { habits: [], profile: DEFAULT_PROFILE };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading mock database:', error);
    return { habits: [], profile: DEFAULT_PROFILE };
  }
}

async function writeDb(data: DbData) {
  // 1. Try to write to cookies (resilient session fallback for Vercel/serverless)
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    cookieStore.set('zenplan_db', encodeURIComponent(JSON.stringify(data)), {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      sameSite: 'lax',
    });
  } catch (error) {
    // cookies() not available (e.g. outside request context)
  }

  // 2. Fallback to writing to local file system
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing mock database:', error);
  }
}

// Streak Calculation Helper
function calculateStreaks(history: Record<string, boolean>): { current: number; max: number } {
  const dates = Object.keys(history)
    .filter((d) => history[d])
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // descending order (latest first)

  if (dates.length === 0) {
    return { current: 0, max: 0 };
  }

  // 1. Calculate current streak
  let currentStreak = 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const hasCompletedToday = history[todayStr];
  const hasCompletedYesterday = history[yesterdayStr];

  // If not completed today and not completed yesterday, current streak is broken (0)
  if (!hasCompletedToday && !hasCompletedYesterday) {
    currentStreak = 0;
  } else {
    let checkDate = hasCompletedToday ? new Date() : yesterday;
    let keepCounting = true;
    while (keepCounting) {
      const checkStr = checkDate.toISOString().split('T')[0];
      if (history[checkStr]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1); // step back one day
      } else {
        keepCounting = false;
      }
    }
  }

  // 2. Calculate max streak (longest consecutive runs)
  let maxStreak = 0;
  let tempStreak = 0;
  const sortedDatesAsc = Object.keys(history)
    .filter((d) => history[d])
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()); // ascending (earliest first)

  if (sortedDatesAsc.length > 0) {
    let lastDate: Date | null = null;
    for (const dStr of sortedDatesAsc) {
      const curDate = new Date(dStr);
      if (lastDate === null) {
        tempStreak = 1;
      } else {
        const diffTime = Math.abs(curDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          if (tempStreak > maxStreak) maxStreak = tempStreak;
          tempStreak = 1;
        }
      }
      lastDate = curDate;
    }
    if (tempStreak > maxStreak) maxStreak = tempStreak;
  }

  return { current: currentStreak, max: maxStreak };
}

export const mockDb = {
  getHabits: async (): Promise<Habit[]> => {
    const data = await readDb();
    return data.habits;
  },

  addHabit: async (name: string, description: string, category: string, frequency: string): Promise<Habit> => {
    const data = await readDb();
    const newHabit: Habit = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      description,
      category,
      frequency,
      createdAt: new Date().toISOString(),
      history: {},
      currentStreak: 0,
      maxStreak: 0,
    };
    data.habits.push(newHabit);
    await writeDb(data);
    return newHabit;
  },

  toggleHabitDay: async (habitId: string, dateStr: string): Promise<Habit | null> => {
    const data = await readDb();
    const habitIndex = data.habits.findIndex((h) => h.id === habitId);
    if (habitIndex === -1) return null;

    const habit = data.habits[habitIndex];
    habit.history[dateStr] = !habit.history[dateStr];

    const { current, max } = calculateStreaks(habit.history);
    habit.currentStreak = current;
    habit.maxStreak = max;

    data.habits[habitIndex] = habit;
    await writeDb(data);
    return habit;
  },

  deleteHabit: async (habitId: string): Promise<boolean> => {
    const data = await readDb();
    const initialLength = data.habits.length;
    data.habits = data.habits.filter((h) => h.id !== habitId);
    await writeDb(data);
    return data.habits.length < initialLength;
  },

  getProfile: async (): Promise<Profile> => {
    const data = await readDb();
    return data.profile;
  },

  updateProfile: async (updates: Partial<Profile>): Promise<Profile> => {
    const data = await readDb();
    data.profile = { ...data.profile, ...updates };
    await writeDb(data);
    return data.profile;
  },
};
