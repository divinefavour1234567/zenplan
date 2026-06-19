'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  CheckCircle2, 
  BarChart3, 
  BrainCircuit, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Crown,
  Play
} from 'lucide-react';

export default function LandingPage() {
  const [demoStreak, setDemoStreak] = useState(5);
  const [demoCompleted, setDemoCompleted] = useState(false);

  const toggleDemoHabit = () => {
    if (demoCompleted) {
      setDemoStreak(prev => prev - 1);
    } else {
      setDemoStreak(prev => prev + 1);
    }
    setDemoCompleted(!demoCompleted);
  };

  return (
    <div className="flex min-h-screen flex-col overflow-hidden text-slate-100">
      {/* Header */}
      <header className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Zen<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Plan</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            id="btn-nav-dashboard"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-all duration-200"
          >
            Launch Dashboard
          </Link>
          <Link 
            href="/dashboard"
            id="btn-nav-get-started"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/10 hover:bg-indigo-500 hover:shadow-indigo-500/20 transition-all duration-200"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow z-10">
        <section className="relative mx-auto max-w-7xl px-4 pt-16 pb-24 sm:px-6 lg:px-8 text-center">
          {/* Subtle Glows */}
          <div className="absolute left-1/2 top-0 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />
          
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 text-xs sm:text-sm font-medium text-indigo-300 mb-8 animate-pulse-subtle">
            <Crown className="h-3.5 w-3.5 text-indigo-400" />
            <span>Built for the AWS & Vercel Hackathon</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white mb-6">
            Master Your Habits.<br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Design Your Perfect Routine.
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-400 mb-10">
            Supercharge your consistency using a beautifully clean dark interface. Connect with an interactive AI routine coach and track streaks at scale on AWS DynamoDB serverless infrastructure.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link 
              href="/dashboard"
              id="btn-hero-cta"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Start Your Journey 
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a 
              href="#interactive-demo"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-8 py-4 text-base font-semibold text-slate-200 transition-all duration-200"
            >
              <Play className="h-4 w-4 fill-slate-200" />
              Try Live Demo
            </a>
          </div>

          {/* Interactive Showcase App Mockup */}
          <div id="interactive-demo" className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-slate-950/40 p-4 sm:p-6 backdrop-blur-xl shadow-2xl relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none" />
            
            {/* Window header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs text-slate-500 font-mono">zenplan.app/demo</span>
              <div className="w-12" /> {/* spacer */}
            </div>

            {/* Interactive Component Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                  Try Toggling the Habit
                </h3>
                <p className="text-sm text-slate-400 mb-6">
                  Complete this habit to watch the streak update in real-time. Notice the smooth scale animations and completion badges.
                </p>

                {/* Habit Card Mockup */}
                <div 
                  onClick={toggleDemoHabit}
                  className={`glass-panel p-5 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-between select-none ${
                    demoCompleted 
                      ? 'border-indigo-500/40 bg-indigo-500/5 shadow-md shadow-indigo-500/10' 
                      : 'border-white/5 bg-slate-900/40 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${
                      demoCompleted ? 'bg-indigo-500 text-white scale-110 shadow-lg shadow-indigo-500/40' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <Zap className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">Write Clean Code</h4>
                      <p className="text-xs text-slate-500">Every day • Coding & Mind</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Streak</div>
                      <div className={`font-bold transition-all duration-300 text-lg ${
                        demoCompleted ? 'text-indigo-400 scale-110' : 'text-slate-300'
                      }`}>
                        🔥 {demoStreak} days
                      </div>
                    </div>
                    
                    {/* Checkbox circle */}
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-200 ${
                      demoCompleted ? 'bg-indigo-500 border-indigo-400 text-white scale-115' : 'border-slate-600'
                    }`}>
                      {demoCompleted && <CheckCircle2 className="h-4 w-4 fill-indigo-500" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Coach Suggestion Mockup */}
              <div className="flex flex-col justify-between rounded-xl bg-slate-950/60 p-5 border border-white/5">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <BrainCircuit className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">AI Coach Advice</span>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-sm italic text-slate-300">
                      &quot;Great job completing your coding block! Completing this today keeps your streak alive at <span className="font-semibold text-indigo-300">{demoStreak} days</span>. Consistency is the secret to engineering mastery. Keep moving!&quot;
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-xs text-slate-500">Response time: 0.1s</span>
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    AWS Database Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Engineered for High-Scale Consistency
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              Leveraging Next.js App Router and Amazon Web Services to deliver lightning-fast streak computations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-2xl border border-white/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-6">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI routine feedback</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Connect your habit logs with an artificial intelligence companion to review patterns, receive reminders, and adjust difficulty.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-white/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AWS DynamoDB Scaling</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your streaks are recorded on Amazon DynamoDB. Experience sub-millisecond lookups and enterprise reliability.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-white/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-6">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Detailed Analytics</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Visualize compliance charts, best streaks, habit categories, and monthly completion heatmaps with premium custom visuals.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing / Monetization Track */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Simple, Transparent Plans
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              Unlock advanced metrics, unlimited habit sheets, and premium AI advice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col justify-between relative overflow-hidden">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Zen Starter</h3>
                <p className="text-xs text-slate-400 mb-6">Perfect to test habits</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-white">$0</span>
                  <span className="text-slate-500 text-sm">/ forever</span>
                </div>

                <ul className="space-y-4 text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                    <span>Track up to 3 Habits</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                    <span>Basic Streak Calculations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                    <span>Local Database Persistency</span>
                  </li>
                </ul>
              </div>

              <Link 
                href="/dashboard"
                id="btn-pricing-free"
                className="mt-8 block w-full text-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 py-3 text-sm font-semibold text-white transition-all duration-200"
              >
                Access Dashboard
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="glass-panel p-8 rounded-2xl border border-indigo-500/30 flex flex-col justify-between relative overflow-hidden shadow-indigo-500/5 shadow-lg bg-gradient-to-b from-indigo-950/20 to-slate-950">
              <div className="absolute right-0 top-0 bg-indigo-500 px-4 py-1 text-2xs uppercase tracking-wider font-semibold text-white rounded-bl-xl flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Popular
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">Zen Pro</h3>
                <p className="text-xs text-indigo-300 mb-6">Unlimited tracking & AI coach</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-white">$9</span>
                  <span className="text-slate-500 text-sm">/ month</span>
                </div>

                <ul className="space-y-4 text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <Crown className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                    <span className="font-medium text-slate-100">Unlimited Habits tracking</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Crown className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                    <span>Serverless AWS DynamoDB Storage</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Crown className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                    <span className="font-semibold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                      Unlimited smart AI Coach advice
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Crown className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                    <span>Advanced Streaks & Milestone Badges</span>
                  </li>
                </ul>
              </div>

              <Link 
                href="/settings"
                id="btn-pricing-premium"
                className="mt-8 block w-full text-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all duration-200"
              >
                Upgrade to Pro Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 bg-slate-950/60 z-10 text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-slate-500">
            © 2026 ZenPlan Inc. Built with Next.js, Vercel, and AWS.
          </span>
          <div className="flex gap-6 text-sm text-slate-500">
            <span className="hover:text-slate-300 transition-colors">Privacy</span>
            <span className="hover:text-slate-300 transition-colors">Terms of Service</span>
            <span className="hover:text-slate-300 transition-colors">Documentation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
