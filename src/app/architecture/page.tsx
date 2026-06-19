'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { 
  Database, 
  Globe, 
  Cpu, 
  FileCode, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Zap,
  HelpCircle,
  Server
} from 'lucide-react';

interface ComponentSpec {
  title: string;
  category: string;
  tech: string;
  description: string;
  details: string[];
}

export default function ArchitecturePage() {
  const [activeNode, setActiveNode] = useState<string>('router');
  const [awsActive, setAwsActive] = useState<boolean>(false);

  useEffect(() => {
    // Detect environment variables presence
    if (process.env.AWS_ACCESS_KEY_ID) {
      setAwsActive(true);
    }
  }, []);

  const nodeSpecs: Record<string, ComponentSpec> = {
    client: {
      title: "Next.js Client (SPA)",
      category: "Frontend Layer",
      tech: "React 19, Tailwind CSS v4, Lucide Icons",
      description: "A highly responsive glassmorphic UI utilizing client-side hydration, state synchronization, and CSS custom particle animations.",
      details: [
        "Frictionless client state tracking for streaks",
        "Confetti particle systems built directly in React without canvas overhead",
        "Responsive, mobile-first design system with fluid layout grids"
      ]
    },
    api: {
      title: "Vercel Serverless API Router",
      category: "Middleware / Backend API",
      tech: "Next.js App Router API Routes",
      description: "Serverless Route Handlers executing on demand. They receive client payload, inspect session parameters, and forward requests to the DB client.",
      details: [
        "Path endpoints: `/api/habits`, `/api/habits/toggle`, `/api/profile`, `/api/chat`",
        "Stateless endpoints with fast start times (cold start optimization)",
        "Graceful error handling and HTTP status code dispatching"
      ]
    },
    router: {
      title: "Dynamic DB Dispatcher (db.ts)",
      category: "Logical Router Layer",
      tech: "TypeScript Runtime Inspection",
      description: "A smart wrapper client that inspects environment variables on compile/load. It dynamically selects the active database provider.",
      details: [
        "No-configuration local fallback to file storage for developers",
        "Auto-transition to cloud mode: triggers when AWS_ACCESS_KEY_ID is detected",
        "Maintains a unified API interface regardless of active provider"
      ]
    },
    mockdb: {
      title: "Local JSON File Simulator (mockdb.ts)",
      category: "Storage Layer (Dev Mode)",
      tech: "Node fs, JSON serialization",
      description: "Simulates full database features inside a `.zenplan-db.json` file in the workspace directory. Great for testing, styling, and offline running.",
      details: [
        "Writes changes synchronously to ensure local persistency across server restarts",
        "Implements full mathematical streak and max streak computation algorithms",
        "Provides mock data seed logic for profile settings and initial configurations"
      ]
    },
    dynamodb: {
      title: "Amazon DynamoDB (dynamodb.ts)",
      category: "Storage Layer (Cloud Mode)",
      tech: "@aws-sdk/client-dynamodb (AWS SDK v3)",
      description: "High-scale serverless NoSQL database. Performs operations on DynamoDB tables, providing sub-millisecond performance and automatic global scale.",
      details: [
        "Utilizes DynamoDBDocumentClient with scan, put, update, delete, and get commands",
        "Table structures: `zenplan_habits` (Key: id) and `zenplan_profiles` (Key: userId)",
        "Zero-idle cost serverless scaling, perfect for Next.js serverless integration"
      ]
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 z-10 space-y-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="h-7 w-7 text-indigo-400" />
            Full-Stack Architecture Blueprint
          </h1>
          <p className="text-slate-400 mt-1">
            An interactive layout of the ZenPlan technical stack showing connections from the frontend to the AWS Database.
          </p>
        </div>

        {/* Diagram and Specs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left / Middle: Interactive Diagram */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 space-y-6 overflow-hidden">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="font-bold text-white text-base">Interactive Deployment Flow</h3>
              <span className="text-2xs text-slate-500 font-mono">Click boxes to view components specs</span>
            </div>

            {/* Visual Flow Representation */}
            <div className="flex flex-col gap-10 py-6 items-center relative">
              {/* Animated Connecting Vertical Line */}
              <div className="absolute top-10 bottom-10 left-1/2 w-[1px] bg-gradient-to-b from-indigo-500 via-purple-500 to-cyan-500 opacity-20 pointer-events-none transform -translate-x-1/2" />

              {/* Node 1: Client */}
              <button 
                onClick={() => setActiveNode('client')}
                className={`w-64 glass-panel p-4 rounded-xl border text-center transition-all duration-300 relative ${
                  activeNode === 'client' ? 'border-indigo-500 glow-indigo bg-indigo-950/20 scale-102' : 'border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-sm text-white">Next.js Client UI</h4>
                    <span className="text-3xs text-indigo-400 font-mono">React CSR / SPA</span>
                  </div>
                </div>
              </button>

              <ArrowRight className="h-5 w-5 text-slate-600 transform rotate-90" />

              {/* Node 2: Serverless API */}
              <button 
                onClick={() => setActiveNode('api')}
                className={`w-64 glass-panel p-4 rounded-xl border text-center transition-all duration-300 relative ${
                  activeNode === 'api' ? 'border-purple-500 glow-purple bg-purple-950/20 scale-102' : 'border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-sm text-white">Vercel Serverless APIs</h4>
                    <span className="text-3xs text-purple-400 font-mono">Route Handlers (SSR)</span>
                  </div>
                </div>
              </button>

              <ArrowRight className="h-5 w-5 text-slate-600 transform rotate-90" />

              {/* Node 3: Router */}
              <button 
                onClick={() => setActiveNode('router')}
                className={`w-64 glass-panel p-4 rounded-xl border text-center transition-all duration-300 relative ${
                  activeNode === 'router' ? 'border-indigo-500 glow-indigo bg-indigo-950/20 scale-102' : 'border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <FileCode className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-sm text-white">DB Dispatcher (db.ts)</h4>
                    <span className="text-3xs text-indigo-400 font-mono">Dynamic Router</span>
                  </div>
                </div>
              </button>

              {/* Branch Connecting Lines */}
              <div className="flex justify-between items-center gap-12 w-full max-w-md relative pt-2">
                
                {/* Branch Left: Mock DB */}
                <button 
                  onClick={() => setActiveNode('mockdb')}
                  className={`flex-1 glass-panel p-4 rounded-xl border text-left transition-all duration-300 relative ${
                    activeNode === 'mockdb' ? 'border-slate-400 glow-indigo bg-slate-900/40 scale-102' : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                      <Server className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Local File Simulator</h4>
                      <span className="text-3xs text-slate-500 font-mono">.zenplan-db.json</span>
                    </div>
                  </div>
                  {!awsActive && (
                    <span className="absolute -top-2.5 right-2 rounded-full bg-indigo-500/25 border border-indigo-500/35 px-2 py-0.5 text-4xs font-bold text-indigo-300 uppercase tracking-widest">
                      Active
                    </span>
                  )}
                </button>

                {/* Branch Right: AWS DynamoDB */}
                <button 
                  onClick={() => setActiveNode('dynamodb')}
                  className={`flex-1 glass-panel p-4 rounded-xl border text-left transition-all duration-300 relative ${
                    activeNode === 'dynamodb' ? 'border-cyan-500 glow-cyan bg-cyan-950/20 scale-102' : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                      <Database className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">AWS DynamoDB</h4>
                      <span className="text-3xs text-cyan-400 font-mono">Serverless Cloud</span>
                    </div>
                  </div>
                  {awsActive && (
                    <span className="absolute -top-2.5 right-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-4xs font-bold text-emerald-300 uppercase tracking-widest animate-pulse-subtle">
                      Active
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Section: Node Specification Card Details */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/5 h-full min-h-[460px] flex flex-col justify-between">
              <div>
                {/* Spec Header */}
                <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-indigo-400 font-mono">
                    {nodeSpecs[activeNode].category}
                  </span>
                  <span className="text-3xs text-slate-500">Selected Node Specification</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">
                  {nodeSpecs[activeNode].title}
                </h3>
                <span className="text-xs text-slate-400 italic block mb-6">
                  {nodeSpecs[activeNode].tech}
                </span>

                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  {nodeSpecs[activeNode].description}
                </p>

                {/* Details List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">Key Highlights</h4>
                  {nodeSpecs[activeNode].details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-400">
                      <CheckCircle2 className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AWS Info Footer */}
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-3xs text-slate-400">
                  Dual-mode compatibility ensures flawless local developer offline sandbox environments.
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
