'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { 
  Settings, 
  Crown, 
  Database, 
  User, 
  CheckCircle2, 
  AlertTriangle,
  Mail,
  Loader2,
  X
} from 'lucide-react';
import { Profile } from '@/lib/types';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>({
    name: 'Zen Developer',
    email: 'zen@hackathon.com',
    isPremium: false,
    premiumSince: null,
  });
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [dbMode, setDbMode] = useState<'Local' | 'AWS DynamoDB'>('Local');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(`/api/profile?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setNameInput(data.name);
          setEmailInput(data.email);
        }

        // Detect if AWS env vars are present by fetching database mode (simulated/real checking)
        // If DB client was compiled server-side, we check standard envs or we can ask the server
        const habitsRes = await fetch(`/api/habits?t=${Date.now()}`, { cache: 'no-store' });
        // Standard Next.js server console will log provider, but we can also detect if table config is loaded
      } catch (err) {
        console.error('Failed to load profile settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput, email: emailInput }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setSaveSuccess(true);
        // Dispatch custom event to tell Navbar to reload profile info
        window.dispatchEvent(new Event('profile-updated'));
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSimulateUpgrade = async () => {
    if (profile.isPremium) {
      setUpgrading(true);
      setTimeout(async () => {
        try {
          const res = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPremium: false }),
          });

          if (res.ok) {
            const updated = await res.json();
            setProfile(updated);
            window.dispatchEvent(new Event('profile-updated'));
          }
        } catch (err) {
          console.error('Cancel simulation failed:', err);
        } finally {
          setUpgrading(false);
        }
      }, 1000);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const handleConfirmUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpgrading(true);

    setTimeout(async () => {
      try {
        const res = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPremium: true }),
        });

        if (res.ok) {
          const updated = await res.json();
          setProfile(updated);
          window.dispatchEvent(new Event('profile-updated'));
          setIsCheckoutOpen(false);
        }
      } catch (err) {
        console.error('Upgrade simulation failed:', err);
      } finally {
        setUpgrading(false);
      }
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 z-10 space-y-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="h-7 w-7 text-indigo-400" />
            Account Settings
          </h1>
          <p className="text-slate-400 mt-1">Configure database configurations, profile items, and subscription details.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
            <p className="text-slate-400 text-sm mt-4">Loading configurations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left section: profile edits */}
            <div className="md:col-span-2 space-y-6">
              {/* Profile Details Card */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-400" />
                  User Profile
                </h3>

                <form onSubmit={handleSaveProfile} className="space-y-4" id="form-save-profile">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Username / Name
                    </label>
                    <input
                      type="text"
                      required
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      id="input-profile-name"
                      className="w-full rounded-xl px-4 py-3 text-sm glass-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      id="input-profile-email"
                      className="w-full rounded-xl px-4 py-3 text-sm glass-input"
                    />
                  </div>

                  {saveSuccess && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 animate-pulse-subtle">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Changes saved successfully!</span>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      id="btn-save-profile"
                      disabled={saving}
                      className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white transition-colors"
                    >
                      {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              </div>

              {/* AWS Connection Diagnostics Card */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-400" />
                  AWS Stack Diagnostics
                </h3>

                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  The application is configured to scan environment credentials. When deploying on Vercel or locally, configure AWS credentials to auto-transition the database core.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-xs text-slate-300">AWS Connection Mode</span>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-2xs font-bold border ${
                      profile.dbMode === 'Amazon DynamoDB'
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                    }`}>
                      {profile.dbMode === 'Amazon DynamoDB' ? 'Amazon DynamoDB (Cloud)' : 'Local File Simulator'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-xs text-slate-300">Target DynamoDB Tables</span>
                    <span className="text-xs text-slate-400 font-mono">zenplan_habits, zenplan_profiles</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">AWS Target Region</span>
                    <span className="text-xs text-slate-400 font-mono">{process.env.AWS_REGION || 'us-east-1 (default)'}</span>
                  </div>
                </div>

                {!process.env.AWS_ACCESS_KEY_ID && (
                  <div className="mt-6 flex items-start gap-2 bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3.5">
                    <AlertTriangle className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <p className="text-3xs text-slate-400 leading-normal">
                      **Running in local fallback mode.** To connect a real AWS database, create a DynamoDB table named `zenplan_habits` (Partition Key: `id` [string]) and `zenplan_profiles` (Partition Key: `userId` [string]), then add `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION` to your environment settings.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right section: subscription details */}
            <div className="space-y-6">
              {/* Premium Plan Card */}
              <div className={`glass-panel p-6 rounded-2xl border flex flex-col justify-between h-full relative overflow-hidden transition-all duration-300 ${
                profile.isPremium 
                  ? 'border-yellow-500/30 shadow-md shadow-yellow-500/5 bg-gradient-to-b from-slate-900 to-amber-950/10' 
                  : 'border-white/5'
              }`}>
                {profile.isPremium && (
                  <div className="absolute right-0 top-0 bg-yellow-500 px-3.5 py-1 text-4xs uppercase tracking-wider font-bold text-slate-950 rounded-bl-xl flex items-center gap-0.5">
                    <Crown className="h-2.5 w-2.5" />
                    Active
                  </div>
                )}

                <div>
                  <h3 className="text-base font-bold text-white mb-1">Membership Plan</h3>
                  <span className="text-slate-500 text-xs">Monetization verification module</span>

                  <div className="my-6 text-center py-6 bg-slate-950/40 rounded-xl border border-white/5">
                    <span className="text-3xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Current Plan</span>
                    <h2 className={`text-2xl font-extrabold tracking-tight ${
                      profile.isPremium ? 'text-yellow-400' : 'text-white'
                    }`}>
                      {profile.isPremium ? 'Zen Pro Account' : 'Zen Free Account'}
                    </h2>
                    <span className="text-xs text-slate-500 block mt-2">
                      {profile.isPremium ? '$9 / Month • Billing active' : '$0 / Month • Limited 3 Habits'}
                    </span>
                  </div>

                  {profile.isPremium ? (
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span>Unlimited habit segments active</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span>Advanced charts enabled</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span>Active since {new Date(profile.premiumSince || '').toLocaleDateString()}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="h-4 w-4 text-slate-600 flex-shrink-0" />
                        <span>Limited to 3 habits</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="h-4 w-4 text-slate-600 flex-shrink-0" />
                        <span>Basic statistics only</span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSimulateUpgrade}
                  id="btn-simulate-subscription"
                  disabled={upgrading}
                  className={`mt-4 w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold shadow-md transition-all duration-200 ${
                    profile.isPremium
                      ? 'bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 hover:text-white'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/10 hover:shadow-indigo-500/20'
                  }`}
                >
                  {upgrading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Crown className="h-4 w-4" />
                      <span>{profile.isPremium ? 'Simulate Cancel Pro' : 'Simulate Purchase Pro ($9)'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Checkout Modal Overlay */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-white/10 p-6 bg-slate-900 shadow-2xl relative">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-5 w-5 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Stripe Checkout</h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Simulated sandbox payment for <span className="font-semibold text-white">Zen Pro</span>. You can enter any mock test values.
            </p>

            <form onSubmit={handleConfirmUpgrade} className="space-y-4">
              {/* Card Number */}
              <div>
                <label className="block text-3xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    className="w-full rounded-xl px-4 py-3 text-sm glass-input pr-12"
                  />
                  <span className="absolute right-3.5 top-3.5 text-3xs font-bold text-indigo-400 uppercase tracking-widest">VISA</span>
                </div>
              </div>

              {/* Expiry and CVC */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-3xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Expiration Date
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full rounded-xl px-4 py-3 text-sm glass-input text-center"
                  />
                </div>
                <div>
                  <label className="block text-3xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    CVC Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    maxLength={4}
                    className="w-full rounded-xl px-4 py-3 text-sm glass-input text-center"
                  />
                </div>
              </div>

              {/* Cardholder name */}
              <div>
                <label className="block text-3xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Zen Developer"
                  className="w-full rounded-xl px-4 py-3 text-sm glass-input"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="rounded-xl border border-white/5 bg-white/3 hover:bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={upgrading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all duration-200"
                >
                  {upgrading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Pay $9.00 USD</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
