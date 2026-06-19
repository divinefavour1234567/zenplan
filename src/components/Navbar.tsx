'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Sparkles, 
  CheckCircle2, 
  BarChart3, 
  Settings, 
  Crown, 
  Menu, 
  X,
  User,
  Database
} from 'lucide-react';

interface ProfileData {
  name: string;
  isPremium: boolean;
}

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Zen Developer',
    isPremium: false,
  });

  // Fetch profile status on mount to sync "PRO" tag
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`/api/profile?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error('Failed to load profile for navbar:', err);
      }
    }
    loadProfile();

    // Set up local storage listener to sync when user upgrades
    const handleStorageChange = () => {
      loadProfile();
    };
    window.addEventListener('storage', handleStorageChange);
    // Custom event dispatcher when settings are saved
    window.addEventListener('profile-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profile-updated', handleStorageChange);
    };
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: CheckCircle2 },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'AI Coach', href: '/ai-coach', icon: Sparkles },
    { name: 'Architecture', href: '/architecture', icon: Database },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="glass-panel sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/40 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2" id="nav-logo">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Zen<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Plan</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:block">
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    id={`nav-link-${item.name.toLowerCase()}`}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Status Tag */}
          <div className="hidden md:flex items-center gap-4">
            {profile.isPremium ? (
              <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-yellow-500/30 px-3 py-1 text-xs font-semibold text-yellow-300 animate-pulse-subtle">
                <Crown className="h-3.5 w-3.5 text-yellow-400" />
                <span>PRO</span>
              </div>
            ) : (
              <Link
                href="/settings"
                className="flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 transition-all duration-200"
              >
                <span>Upgrade</span>
              </Link>
            )}

            <div className="flex items-center gap-2 border-l border-white/10 pl-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/20">
                <User className="h-4 w-4 text-purple-400" />
              </div>
              <span className="text-sm font-medium text-slate-300">{profile.name}</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              id="mobile-menu-toggle"
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-white/5 bg-slate-950/95">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  id={`mobile-nav-link-${item.name.toLowerCase()}`}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-500/15 text-indigo-300'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}

            {/* Mobile User Section */}
            <div className="border-t border-white/5 mt-4 pt-4 px-3 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/15">
                    <User className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{profile.name}</div>
                    <div className="text-xs text-slate-400">Zen Companion</div>
                  </div>
                </div>
                {profile.isPremium ? (
                  <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-yellow-500/30 px-2.5 py-0.5 text-xs font-semibold text-yellow-300">
                    <Crown className="h-3 w-3 text-yellow-400" />
                    <span>PRO</span>
                  </div>
                ) : (
                  <Link
                    href="/settings"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full bg-indigo-500/10 border border-indigo-500/25 px-3 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20"
                  >
                    Upgrade
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
