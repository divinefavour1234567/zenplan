'use client';

import React, { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { 
  Sparkles, 
  Send, 
  BrainCircuit, 
  HelpCircle, 
  BookOpen, 
  Zap,
  Bot
} from 'lucide-react';

interface SuggestedHabit {
  name: string;
  description: string;
  category: string;
  frequency: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedHabit?: SuggestedHabit;
  added?: boolean;
}

export default function AICoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I am your Zen AI Coach. I inspect your active streaks and completion histories in your AWS database to help you stay accountable. Ask me about your streaks, today's score, or for advice on structuring your routine!`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: textToSend
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      if (res.ok) {
        const data = await res.json();
        
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Math.random().toString(),
            role: 'assistant',
            content: data.response,
            suggestedHabit: data.suggestedHabit
          }]);
          setIsTyping(false);
        }, 600);
      } else {
        throw new Error('Failed to fetch response');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'assistant',
        content: "Sorry, I ran into an error connecting to my cognitive advisor module. Please try again!"
      }]);
    }
  };

  const handleAddSuggested = async (msgId: string, habit: SuggestedHabit) => {
    try {
      // 1. Fetch current profile & habits to check Free limit
      const habitsRes = await fetch(`/api/habits?t=${Date.now()}`, { cache: 'no-store' });
      const profileRes = await fetch(`/api/profile?t=${Date.now()}`, { cache: 'no-store' });
      if (habitsRes.ok && profileRes.ok) {
        const habitsList = await habitsRes.json();
        const profileInfo = await profileRes.json();

        if (!profileInfo.isPremium && habitsList.length >= 3) {
          alert('You have reached the limit of 3 habits on the Free Tier. Upgrade to Pro in Settings to track unlimited habits!');
          return;
        }
      }

      // 2. Post to habits database
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habit),
      });

      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, added: true } : m));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add suggested habit.');
      }
    } catch (err) {
      console.error('Error adding suggested habit:', err);
      alert('Error adding suggested habit to database.');
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const suggestionChips = [
    { label: "Analyze my Streaks", query: "How are my streaks looking?" },
    { label: "Check Today's Score", query: "What is my progress score for today?" },
    { label: "Suggest a Daily Routine", query: "Suggest a routine structure for my habits" },
    { label: "What is the 2-Minute Rule?", query: "What is the 2-minute rule and how can it help me?" }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 z-10 flex flex-col md:flex-row gap-6">
        {/* Chat Section */}
        <div className="flex-grow flex flex-col glass-panel rounded-2xl border border-white/5 overflow-hidden h-[calc(100vh-12rem)] md:h-[600px]">
          {/* Header */}
          <div className="border-b border-white/5 px-6 py-4 flex items-center gap-3 bg-slate-950/20">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Zen AI Coach</h2>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Context-Aware Active
              </span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${
                  msg.role === 'user' 
                    ? 'bg-indigo-500/15 border border-indigo-500/25 text-indigo-400' 
                    : 'bg-purple-500/10 border border-purple-500/20 text-purple-400'
                }`}>
                  {msg.role === 'user' ? 'U' : <Sparkles className="h-4 w-4" />}
                </div>

                {/* Message Bubble Column */}
                <div className="flex flex-col gap-2">
                  <div className={`rounded-2xl p-4 text-sm leading-relaxed border ${
                    msg.role === 'user'
                      ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-100 rounded-tr-none'
                      : 'glass-panel text-slate-200 rounded-tl-none'
                  }`}>
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>

                  {/* Dynamic Suggestion Card */}
                  {msg.suggestedHabit && (
                    <div className="glass-panel border-purple-500/20 bg-purple-500/5 p-4 rounded-xl max-w-sm mt-1 animate-fade-in flex flex-col gap-3">
                      <div>
                        <span className="text-4xs font-bold uppercase tracking-wider text-purple-400">AI Routine Suggestion</span>
                        <h4 className="font-bold text-slate-200 text-xs mt-1">{msg.suggestedHabit.name}</h4>
                        <p className="text-3xs text-slate-400 mt-0.5 leading-normal">{msg.suggestedHabit.description}</p>
                      </div>
                      
                      <button
                        onClick={() => handleAddSuggested(msg.id, msg.suggestedHabit!)}
                        disabled={msg.added}
                        className={`text-center rounded-lg py-2 text-3xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                          msg.added 
                            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 cursor-default' 
                            : 'bg-purple-500/15 border border-purple-500/25 hover:bg-purple-500/25 text-purple-300 hover:text-white'
                        }`}
                      >
                        {msg.added ? '✓ Added to Dashboard' : 'Add to Dashboard'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Sparkles className="h-4 w-4 animate-pulse-subtle" />
                </div>
                <div className="glass-panel border-white/5 rounded-2xl rounded-tl-none p-4 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt chips suggestions */}
          <div className="px-6 py-2 border-t border-white/5 overflow-x-auto flex gap-2 no-scrollbar bg-slate-950/10 select-none">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.query)}
                className="flex-shrink-0 text-3xs font-semibold uppercase tracking-wider text-slate-400 border border-white/5 hover:border-indigo-500/40 hover:text-indigo-300 rounded-full px-3 py-1.5 bg-white/2 hover:bg-indigo-500/5 transition-all duration-200"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Form Input */}
          <div className="border-t border-white/5 p-4 bg-slate-950/20">
            <form onSubmit={onSubmit} className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask your coach anything about habits..."
                className="flex-grow rounded-xl px-4 py-3 text-sm glass-input"
                id="input-coach-chat"
              />
              <button
                type="submit"
                id="btn-send-coach-chat"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all duration-200"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Info Section */}
        <div className="w-full md:w-80 flex-shrink-0 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-purple-400" />
              Cognitive Habit Design
            </h3>
            
            <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
              <div className="flex gap-2">
                <Zap className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-200 mb-0.5">The Habit Loop</h4>
                  <p>Every habit needs a **Cue** (trigger), a **Routine** (behavior), and a **Reward** (positive reinforcement like checking the box!).</p>
                </div>
              </div>

              <div className="flex gap-2">
                <BookOpen className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-200 mb-0.5">Habit Stacking</h4>
                  <p>Attach new habits directly to existing routines. E.g. &quot;After I make my morning coffee, I will write clean code for 30 minutes.&quot;</p>
                </div>
              </div>

              <div className="flex gap-2">
                <HelpCircle className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-200 mb-0.5">Cognitive Friction</h4>
                  <p>Reduce friction for good habits (prepare materials beforehand) and increase friction for bad habits (unplug the TV).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
