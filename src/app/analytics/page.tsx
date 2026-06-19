'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { 
  BarChart3, 
  Flame, 
  TrendingUp, 
  Calendar,
  Compass,
  Award,
  Sparkles,
  Trophy,
  CheckCircle,
  Crown
} from 'lucide-react';
import { Habit, Profile } from '@/lib/db';

export default function AnalyticsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [profile, setProfile] = useState<Profile>({
    name: 'Zen Developer',
    email: 'zen@hackathon.com',
    isPremium: false,
    premiumSince: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const habitsRes = await fetch('/api/habits');
        const profileRes = await fetch('/api/profile');
        if (habitsRes.ok && profileRes.ok) {
          const habitsData = await habitsRes.json();
          const profileData = await profileRes.json();
          setHabits(habitsData);
          setProfile(profileData);
        }
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Helper to generate last 7 days labels
  const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push({
        dateStr: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate()
      });
    }
    return dates;
  };

  const last7Days = getLast7Days();

  // Statistics calculations
  const totalHabits = habits.length;
  
  // Calculate completion count over the last 7 days
  let totalCompletionsLast7Days = 0;
  let totalOpportunitiesLast7Days = totalHabits * 7;
  
  habits.forEach(h => {
    last7Days.forEach(day => {
      if (h.history && h.history[day.dateStr]) {
        totalCompletionsLast7Days++;
      }
    });
  });

  const weeklyCompletionRate = totalOpportunitiesLast7Days > 0 
    ? Math.round((totalCompletionsLast7Days / totalOpportunitiesLast7Days) * 100) 
    : 0;

  // Category counts and completions
  const categoryStats: Record<string, { total: number; completed: number }> = {
    Mind: { total: 0, completed: 0 },
    Health: { total: 0, completed: 0 },
    Fitness: { total: 0, completed: 0 },
    Work: { total: 0, completed: 0 },
    Creative: { total: 0, completed: 0 },
  };

  habits.forEach(h => {
    if (categoryStats[h.category] !== undefined) {
      categoryStats[h.category].total += 7; // 7 days opportunities
      last7Days.forEach(day => {
        if (h.history && h.history[day.dateStr]) {
          categoryStats[h.category].completed++;
        }
      });
    }
  });

  // Streaks info
  const bestStreak = habits.reduce((max, h) => (h.maxStreak > max ? h.maxStreak : max), 0);
  const avgStreak = totalHabits > 0 
    ? Math.round(habits.reduce((sum, h) => sum + h.currentStreak, 0) / totalHabits * 10) / 10 
    : 0;

  // Category styling matching dashboard
  const categoryColors: Record<string, string> = {
    Mind: 'from-purple-600 to-indigo-500',
    Health: 'from-emerald-600 to-teal-500',
    Fitness: 'from-pink-600 to-rose-500',
    Work: 'from-blue-600 to-sky-500',
    Creative: 'from-amber-600 to-orange-500',
  };

  // Dynamic Badging / Achievement states logic
  const todayStr = last7Days[6].dateStr;
  const completedToday = habits.filter(h => h.history && h.history[todayStr]).length;
  
  const hasLoggedOnce = habits.some(h => h.history && Object.values(h.history).some(v => v === true));
  const isConsistencyMaster = bestStreak >= 7;
  const isUnstoppable = bestStreak >= 14;
  const isPerfectScore = totalHabits > 0 && completedToday === totalHabits;
  const isProPioneer = profile.isPremium;

  const achievements = [
    {
      id: 'first-step',
      name: 'First Steps',
      description: 'Logged your first habit completion.',
      unlocked: hasLoggedOnce,
      icon: CheckCircle,
      unlockedColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25',
      lockedColor: 'text-slate-600 bg-white/2 border-white/5 opacity-40',
    },
    {
      id: 'consistency-master',
      name: 'Consistency Master',
      description: 'Maintain a habit streak of 7+ days.',
      unlocked: isConsistencyMaster,
      icon: Flame,
      unlockedColor: 'text-orange-400 bg-orange-500/10 border-orange-500/25',
      lockedColor: 'text-slate-600 bg-white/2 border-white/5 opacity-40',
    },
    {
      id: 'unstoppable',
      name: 'Unstoppable',
      description: 'Maintain a habit streak of 14+ days.',
      unlocked: isUnstoppable,
      icon: Trophy,
      unlockedColor: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
      lockedColor: 'text-slate-600 bg-white/2 border-white/5 opacity-40',
    },
    {
      id: 'perfect-score',
      name: 'Perfect Day',
      description: 'Complete 100% of your habits today.',
      unlocked: isPerfectScore,
      icon: Sparkles,
      unlockedColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
      lockedColor: 'text-slate-600 bg-white/2 border-white/5 opacity-40',
    },
    {
      id: 'pro-pioneer',
      name: 'Pro Pioneer',
      description: 'Unlocked Zen Pro capabilities.',
      unlocked: isProPioneer,
      icon: Crown,
      unlockedColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25 animate-pulse-subtle',
      lockedColor: 'text-slate-600 bg-white/2 border-white/5 opacity-40',
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 z-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-indigo-400" />
            Consistency Analytics
          </h1>
          <p className="text-slate-400 mt-1">Review habits compliance profiles, streaking records, and timeline summaries.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
            <p className="text-slate-400 text-sm mt-4">Analyzing habits history data...</p>
          </div>
        ) : habits.length === 0 ? (
          <div className="glass-panel rounded-2xl border border-white/5 p-12 text-center max-w-xl mx-auto mt-8">
            <Compass className="h-12 w-12 text-indigo-400 mx-auto mb-4 animate-pulse-subtle" />
            <h3 className="text-lg font-bold text-white mb-2">No History to Analyze</h3>
            <p className="text-sm text-slate-400">
              Complete some habits on the dashboard to populate completion charts and metrics.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top row widget insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Circular Gauge */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">7-Day Scorecard</span>
                
                <div className="relative h-32 w-32 flex items-center justify-center mb-4">
                  <svg className="absolute inset-0 h-full w-full transform -rotate-90">
                    <circle 
                      cx="64" cy="64" r="50" 
                      className="stroke-white/5 fill-transparent" 
                      strokeWidth="10" 
                    />
                    <circle 
                      cx="64" cy="64" r="50" 
                      className="stroke-indigo-500 fill-transparent transition-all duration-500" 
                      strokeWidth="10" 
                      strokeDasharray="314.16" 
                      strokeDashoffset={314.16 - (314.16 * weeklyCompletionRate) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-3xl font-extrabold text-white">{weeklyCompletionRate}%</span>
                </div>
                <p className="text-xs text-slate-400">
                  Overall routine consistency for all active habits over the last 7 days.
                </p>
              </div>

              {/* Streaks Card */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-4">Streak Breakdown</span>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-amber-500" />
                        <span className="text-sm font-medium text-slate-300">Longest Streak</span>
                      </div>
                      <span className="text-lg font-bold text-white">🔥 {bestStreak} days</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-indigo-400" />
                        <span className="text-sm font-medium text-slate-300">Average Active Streak</span>
                      </div>
                      <span className="text-lg font-bold text-white">🔥 {avgStreak} days</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 mt-6 flex items-center gap-2 text-xs text-slate-400">
                  <Award className="h-4 w-4 text-purple-400" />
                  <span>Maintain a streak of 7+ days to earn consistency badges!</span>
                </div>
              </div>

              {/* Weekly Insight AI Card */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between bg-gradient-to-b from-indigo-950/15 to-slate-950">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Zen Coach Insights</span>
                  </div>
                  <h4 className="font-bold text-white text-base mb-2">Weekend Consistency Warning</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Based on your habit logs, you perform 20% better during weekdays. Try setting smaller milestones or morning alerts during weekends to keep streaks going!
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5">
                  <a
                    href="/ai-coach"
                    className="text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-1"
                  >
                    Discuss this with AI Coach →
                  </a>
                </div>
              </div>
            </div>

            {/* Achievements/Gamification Section */}
            <div className="glass-panel rounded-2xl border border-white/5 p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Consistency Milestones
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {achievements.map((badge) => {
                  const BadgeIcon = badge.icon;
                  return (
                    <div 
                      key={badge.id}
                      className={`border rounded-xl p-4 flex flex-col items-center text-center justify-between min-h-[160px] transition-all duration-300 ${
                        badge.unlocked ? badge.unlockedColor + ' scale-102' : badge.lockedColor
                      }`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/5 bg-slate-950/50">
                        <BadgeIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white mt-3">{badge.name}</h4>
                        <p className="text-4xs text-slate-400 mt-1 max-w-[120px] mx-auto leading-normal">{badge.description}</p>
                      </div>
                      <span className={`text-4xs font-bold tracking-widest uppercase mt-4 px-2 py-0.5 rounded ${
                        badge.unlocked ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'bg-white/5 text-slate-500 border border-transparent'
                      }`}>
                        {badge.unlocked ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 7-Day Matrix Table Grid */}
            <div className="glass-panel rounded-2xl border border-white/5 p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-400" />
                7-Day Consistency Grid
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 pl-2">Habit Name</th>
                      {last7Days.map(day => (
                        <th key={day.dateStr} className="pb-3 text-center text-xs font-semibold text-slate-400 w-16">
                          <span className="block">{day.dayName}</span>
                          <span className="block text-white font-bold text-xs mt-0.5">{day.dayNum}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {habits.map(habit => (
                      <tr key={habit.id} className="hover:bg-white/1">
                        <td className="py-4 font-semibold text-slate-200 text-sm pl-2">
                          <div className="flex flex-col">
                            <span>{habit.name}</span>
                            <span className="text-3xs text-slate-500 font-normal uppercase tracking-wider mt-0.5">{habit.category}</span>
                          </div>
                        </td>
                        {last7Days.map(day => {
                          const completed = !!(habit.history && habit.history[day.dateStr]);
                          return (
                            <td key={day.dateStr} className="py-4 text-center">
                              <div className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold transition-all ${
                                completed 
                                  ? 'bg-emerald-500/25 border-emerald-400/40 text-emerald-400 shadow-sm shadow-emerald-500/10' 
                                  : 'border-white/5 text-transparent'
                              }`}>
                                ✓
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Performance bar meters */}
            <div className="glass-panel rounded-2xl border border-white/5 p-6">
              <h3 className="text-lg font-bold text-white mb-6">Category Distribution & Performance</h3>
              <div className="space-y-6">
                {Object.keys(categoryStats).map(catName => {
                  const catData = categoryStats[catName];
                  const completionPercent = catData.total > 0 
                    ? Math.round((catData.completed / catData.total) * 100) 
                    : 0;
                  const gradientClass = categoryColors[catName] || 'from-indigo-600 to-indigo-500';

                  const hasCategoryHabit = habits.some(h => h.category === catName);
                  if (!hasCategoryHabit) return null;

                  return (
                    <div key={catName} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-300">{catName}</span>
                        <span className="font-bold text-white">{completionPercent}% completion</span>
                      </div>
                      <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full rounded-full bg-gradient-to-r ${gradientClass} transition-all duration-500`}
                          style={{ width: `${completionPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
