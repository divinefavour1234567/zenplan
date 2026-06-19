export interface Habit {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: string;
  createdAt: string;
  history: Record<string, boolean>; // YYYY-MM-DD -> completed (true/false)
  currentStreak: number;
  maxStreak: number;
}

export interface Profile {
  name: string;
  email: string;
  isPremium: boolean;
  premiumSince: string | null;
  dbMode?: string;
}
