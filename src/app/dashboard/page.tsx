'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { 
  Sparkles, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  Calendar,
  Compass,
  Zap,
  TrendingUp,
  X,
  Crown,
  Info
} from 'lucide-react';
import { Habit, Profile } from '@/lib/types';

export default function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [profile, setProfile] = useState<Profile>({
    name: 'Zen Developer',
    email: 'zen@hackathon.com',
    isPremium: false,
    premiumSince: null,
  });
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeCelebrationHabit, setActiveCelebrationHabit] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Mind');
  const [frequency, setFrequency] = useState('Daily');

  useEffect(() => {
    async function loadData() {
      try {
        const habitsRes = await fetch(`/api/habits?t=${Date.now()}`, { cache: 'no-store' });
        const profileRes = await fetch(`/api/profile?t=${Date.now()}`, { cache: 'no-store' });
        if (habitsRes.ok && profileRes.ok) {
          const habitsData = await habitsRes.json();
          const profileData = await profileRes.json();
          setHabits(habitsData);
          setProfile(profileData);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  // Web Audio Synthesizer for completion chime
  const playSuccessSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      osc.type = 'sine';
      
      // Play a double chime (harmonic chord)
      osc.frequency.setValueAtTime(659.25, now); // E5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      
      osc.frequency.setValueAtTime(880.00, now + 0.08); // A5
      gain.gain.setValueAtTime(0.08, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.log('Audio Context blocked or unsupported:', e);
    }
  };

  // Toggle habit check-off
  const toggleHabit = async (habitId: string, dateStr: string) => {
    const currentHabit = habits.find(h => h.id === habitId);
    const wasCompleted = currentHabit?.history ? !!currentHabit.history[dateStr] : false;

    try {
      const res = await fetch('/api/habits/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: habitId, date: dateStr }),
      });
      if (res.ok) {
        const updatedHabit = await res.json();
        setHabits(prev => prev.map(h => h.id === habitId ? updatedHabit : h));

        // Celebrate with particle confetti and chime sound when toggled to completed
        if (!wasCompleted) {
          playSuccessSound();
          setActiveCelebrationHabit(habitId);
          setTimeout(() => setActiveCelebrationHabit(null), 1000);
        }
      }
    } catch (err) {
      console.error('Error toggling habit:', err);
    }
  };

  // Add habit
  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Check plan restriction: Max 3 habits for free plan
    if (!profile.isPremium && habits.length >= 3) {
      setErrorMsg('You have reached the limit of 3 habits on the Free Tier. Upgrade to Pro to track unlimited habits!');
      return;
    }

    if (!name.trim()) return;

    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, category, frequency }),
      });

      if (res.ok) {
        const newHabit = await res.json();
        setHabits(prev => [...prev, newHabit]);
        // Reset form
        setName('');
        setDescription('');
        setCategory('Mind');
        setFrequency('Daily');
        setIsAddOpen(false);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to add habit.');
      }
    } catch (err) {
      console.error('Error adding habit:', err);
      setErrorMsg('Network error. Failed to add habit.');
    }
  };

  // Load predefined routines framework
  const handleLoadPreset = async (presetName: string) => {
    setLoading(true);
    setErrorMsg('');
    const presets: Record<string, Array<{ name: string; description: string; category: string; frequency: string }>> = {
      dev: [
        { name: "Write Clean Code", description: "Practice clean programming structures and push to repository.", category: "Work", frequency: "Daily" },
        { name: "Read Tech Architecture", description: "Read engineering blogs or review system designs.", category: "Mind", frequency: "Daily" },
        { name: "Hydrate & Stand", description: "Drink water and step away from the desk for 3 minutes.", category: "Health", frequency: "Daily" }
      ],
      mindfulness: [
        { name: "Morning Meditation", description: "10 minutes of guided breathing to start the day aligned.", category: "Mind", frequency: "Daily" },
        { name: "Cardio Workout", description: "30 minutes of jogging or training session.", category: "Fitness", frequency: "Daily" },
        { name: "Screen-Free Evening", description: "Spend the last hour before bed away from all device screens.", category: "Creative", frequency: "Daily" }
      ]
    };

    const habitsToLoad = presets[presetName];
    if (!habitsToLoad) return;

    try {
      for (const item of habitsToLoad) {
        await fetch('/api/habits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
      }
      
      // Re-fetch habits
      const res = await fetch(`/api/habits?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setHabits(data);
      }
    } catch (err) {
      console.error('Failed to load presets:', err);
      setErrorMsg('Failed to load preset templates.');
    } finally {
      setLoading(false);
    }
  };

  // Delete habit
  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this habit? All streak data will be lost.')) return;

    try {
      const res = await fetch(`/api/habits?id=${habitId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setHabits(prev => prev.filter(h => h.id !== habitId));
      }
    } catch (err) {
      console.error('Error deleting habit:', err);
    }
  };

  // Statistics Computations
  const totalHabits = habits.length;
  const completedToday = habits.filter(h => h.history && h.history[getTodayStr()]).length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const longestStreak = habits.reduce((max, h) => (h.maxStreak > max ? h.maxStreak : max), 0);

  // Category visual styles
  const categoryStyles: Record<string, { bg: string; text: string; border: string }> = {
    Health: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    Mind: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    Fitness: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
    Work: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    Creative: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 z-10">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              Welcome back, {profile.name}
            </h1>
            <p className="text-slate-400 mt-1">Here is your consistency roadmap for today.</p>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            id="btn-add-habit-modal"
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/10 hover:bg-indigo-500 hover:shadow-indigo-500/20 transition-all duration-200"
          >
            <Plus className="h-4.5 w-4.5" />
            Add New Habit
          </button>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Habits</span>
              <h3 className="text-3xl font-extrabold text-white mt-2" id="stat-total-habits">{totalHabits}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Compass className="h-6 w-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Today&apos;s Score</span>
              <h3 className="text-3xl font-extrabold text-white mt-2" id="stat-today-score">{completionRate}%</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Best Streak</span>
              <h3 className="text-3xl font-extrabold text-white mt-2" id="stat-longest-streak">🔥 {longestStreak} days</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Zap className="h-6 w-6 animate-pulse-subtle" />
            </div>
          </div>
        </div>

        {/* Free Plan Limit Warning Alert Banner */}
        {!profile.isPremium && habits.length >= 3 && (
          <div className="glass-panel border-amber-500/30 bg-amber-500/5 p-4 rounded-xl mb-8 flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-grow">
              <h4 className="font-bold text-amber-300 text-sm">Free Account Limit Reached</h4>
              <p className="text-xs text-slate-300 mt-1">
                You are currently tracking 3 habits. To add more habits and unlock advanced metrics with DynamoDB scaling, upgrade to <span className="font-semibold text-yellow-300">Zen Pro</span> in settings.
              </p>
            </div>
            <a
              href="/settings"
              className="text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/20 flex-shrink-0"
            >
              Upgrade
            </a>
          </div>
        )}

        {/* Loading / Empty States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
            <p className="text-slate-400 text-sm mt-4">Connecting to your database...</p>
          </div>
        ) : habits.length === 0 ? (
          <div className="space-y-8 max-w-4xl mx-auto mt-8">
            <div className="glass-panel rounded-2xl border border-white/5 p-10 text-center">
              <Sparkles className="h-12 w-12 text-indigo-400 mx-auto mb-4 animate-pulse-subtle" />
              <h3 className="text-lg font-bold text-white mb-2">No Habits Tracked Yet</h3>
              <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
                Create a custom routine block, or select one of our preset template frameworks to get started immediately.
              </p>
              <button
                onClick={() => setIsAddOpen(true)}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-all duration-200"
              >
                Create Custom Habit
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-white mb-4 text-center">Select an Onboarding Challenge Framework</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => handleLoadPreset('dev')}
                  className="glass-panel p-6 rounded-2xl border border-white/5 text-left hover:border-indigo-500/30 hover:bg-indigo-950/5 transition-all duration-200 group relative overflow-hidden"
                >
                  <h4 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors">💻 Code Sprint Elite</h4>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Perfect for software engineers seeking focus frameworks.</p>
                  <ul className="text-2xs text-slate-500 space-y-1.5 list-disc pl-4">
                    <li>Write Clean Code (Work)</li>
                    <li>Read Tech Architecture (Mind)</li>
                    <li>Hydrate & Stand (Health)</li>
                  </ul>
                  <span className="inline-block mt-6 text-xs font-bold text-indigo-300">Click to Load Challenge →</span>
                </button>

                <button
                  onClick={() => handleLoadPreset('mindfulness')}
                  className="glass-panel p-6 rounded-2xl border border-white/5 text-left hover:border-purple-500/30 hover:bg-purple-950/5 transition-all duration-200 group relative overflow-hidden"
                >
                  <h4 className="font-bold text-white text-base group-hover:text-purple-400 transition-colors">🧘 Zen Mindfulness</h4>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Perfect for establishing peaceful, balanced daily routines.</p>
                  <ul className="text-2xs text-slate-500 space-y-1.5 list-disc pl-4">
                    <li>Morning Meditation (Mind)</li>
                    <li>Cardio Workout (Fitness)</li>
                    <li>Screen-Free Evening (Creative)</li>
                  </ul>
                  <span className="inline-block mt-6 text-xs font-bold text-purple-300">Click to Load Challenge →</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Habits Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map(habit => {
              const todayStr = getTodayStr();
              const yesterdayStr = getYesterdayStr();
              const hasCompletedToday = !!(habit.history && habit.history[todayStr]);
              const hasCompletedYesterday = !!(habit.history && habit.history[yesterdayStr]);
              const colorInfo = categoryStyles[habit.category] || categoryStyles.Mind;

              return (
                <div 
                  key={habit.id} 
                  id={`habit-card-${habit.id}`}
                  className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Confetti Particle Overlay */}
                  {activeCelebrationHabit === habit.id && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-25">
                      {Array.from({ length: 12 }).map((_, i) => {
                        const angle = (i * 360) / 12;
                        const velocity = 35 + Math.random() * 35;
                        const delay = Math.random() * 0.1;
                        const transformX = Math.cos((angle * Math.PI) / 180) * velocity;
                        const transformY = Math.sin((angle * Math.PI) / 180) * velocity - 10;

                        return (
                          <span
                            key={i}
                            className="absolute h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400"
                            style={{
                              animation: `float-particle 0.8s cubic-bezier(0.1, 0.8, 0.3, 1) ${delay}s forwards`,
                              '--tx': `${transformX}px`,
                              '--ty': `${transformY}px`,
                            } as React.CSSProperties}
                          />
                        );
                      })}
                    </div>
                  )}

                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${colorInfo.bg} ${colorInfo.text} ${colorInfo.border}`}>
                        {habit.category}
                      </span>
                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        id={`btn-delete-${habit.id}`}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1 rounded-lg hover:bg-white/5"
                        title="Delete Habit"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white mb-1">{habit.name}</h3>
                    <p className="text-sm text-slate-400 mb-6 line-clamp-2">{habit.description || 'No description provided.'}</p>
                  </div>

                  {/* Completion & Streak Footer */}
                  <div className="border-t border-white/5 pt-4 mt-2">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-slate-500">Streak Metrics</span>
                      <span className="text-sm font-bold text-indigo-300">🔥 {habit.currentStreak} days</span>
                    </div>

                    {/* Daily Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Yesterday Toggle */}
                      <button
                        onClick={() => toggleHabit(habit.id, yesterdayStr)}
                        id={`btn-toggle-yesterday-${habit.id}`}
                        className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-semibold border transition-all duration-200 ${
                          hasCompletedYesterday
                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                            : 'bg-white/3 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-300'
                        }`}
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Yesterday {hasCompletedYesterday ? '✓' : ''}</span>
                      </button>

                      {/* Today Toggle */}
                      <button
                        onClick={() => toggleHabit(habit.id, todayStr)}
                        id={`btn-toggle-today-${habit.id}`}
                        className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold border transition-all duration-200 ${
                          hasCompletedToday
                            ? 'bg-emerald-500/25 border-emerald-500/45 text-emerald-300 scale-102 glow-cyan'
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Today {hasCompletedToday ? 'Done' : 'Complete'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Habit Modal Overlay */}
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel w-full max-w-md rounded-2xl border border-white/10 p-6 bg-slate-900 shadow-2xl relative">
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setErrorMsg('');
                }}
                className="absolute right-4 top-4 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                Add Habit Segment
              </h2>
              <p className="text-xs text-slate-400 mb-6">Create a daily routine block to track in your database.</p>

              {errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs font-medium text-rose-400 mb-6">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleAddHabit} className="space-y-4" id="form-add-habit">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Code in Rust, Morning Meditation"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    id="input-habit-name"
                    className="w-full rounded-xl px-4 py-3 text-sm glass-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Write clean endpoints on DynamoDB for at least 30 minutes."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    id="input-habit-desc"
                    className="w-full rounded-xl px-4 py-3 text-sm glass-input resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      id="select-habit-category"
                      className="w-full rounded-xl px-3 py-3 text-sm glass-input bg-slate-900"
                    >
                      <option value="Mind">Mind</option>
                      <option value="Health">Health</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Work">Work</option>
                      <option value="Creative">Creative</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Frequency
                    </label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      id="select-habit-frequency"
                      className="w-full rounded-xl px-3 py-3 text-sm glass-input bg-slate-900"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddOpen(false);
                      setErrorMsg('');
                    }}
                    className="rounded-xl border border-white/5 bg-white/3 hover:bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="btn-submit-add-habit"
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md"
                  >
                    Create Habit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
