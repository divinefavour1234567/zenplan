import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const habits = await db.getHabits();
    const profile = await db.getProfile();

    const todayStr = new Date().toISOString().split('T')[0];
    const completedToday = habits.filter(h => h.history && h.history[todayStr]).length;
    const totalHabits = habits.length;
    const score = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
    const maxStreak = habits.reduce((max, h) => (h.maxStreak > max ? h.maxStreak : max), 0);
    const currentStreaks = habits.map(h => `${h.name} (${h.currentStreak}d)`).join(', ');

    const lowerMsg = message.toLowerCase();
    let response = '';
    let suggestedHabit: any = null;

    // Context-Aware Responding
    if (lowerMsg.includes('streak') || lowerMsg.includes('burn') || lowerMsg.includes('flame')) {
      if (totalHabits === 0) {
        response = `You don't have any habits set up yet! Go to the Dashboard to create your first habit and start building streaks.`;
      } else if (maxStreak === 0) {
        response = `You have started tracking habits like ${habits[0].name}, but you haven't logged any consecutive days yet. Try logging completions two days in a row to start a fire!`;
      } else {
        response = `Your streak metrics are looking solid! Your best streak is **${maxStreak} days**. Current active streaks: ${currentStreaks}. Consistency is all about keeping that momentum. What can we do to lock in your streak today?`;
      }
    } else if (lowerMsg.includes('score') || lowerMsg.includes('today') || lowerMsg.includes('progress')) {
      if (totalHabits === 0) {
        response = `You haven't added any habits yet. Once you add habits on the Dashboard, I can compute your daily Score.`;
      } else {
        response = `Today, you have completed **${completedToday} of ${totalHabits} habits** (${score}% completion rate). ${
          score === 100 
            ? 'Absolute perfection! You completed everything today. Take a moment to celebrate this win!'
            : 'You are on your way! Completing your remaining habits today will push you closer to that 100% scorecard. Let me know if you need focus techniques.'
        }`;
      }
    } else if (lowerMsg.includes('routine') || lowerMsg.includes('schedule') || lowerMsg.includes('plan')) {
      response = `Based on cognitive design principles, a great daily routine structure is divided into three blocks:
1. **Morning Focus (First 2 hours)**: Do deep mental work (e.g. coding, reading).
2. **Afternoon Flow**: Take care of communications and meetings.
3. **Evening Wind-down**: Focus on physical health, meditation, and offline planning.

Currently, you have ${totalHabits} active habits. I recommend adding a "Morning Planning" routine block to map out daily sprints. You can click the button below to add this recommended habit directly!`;
      
      suggestedHabit = {
        name: 'Morning Planning',
        description: '5 minutes of review of daily goals before checking screens.',
        category: 'Mind',
        frequency: 'Daily'
      };
    } else if (lowerMsg.includes('pro') || lowerMsg.includes('premium') || lowerMsg.includes('upgrade')) {
      response = `Upgrading to **Zen Pro** unlocks real AWS DynamoDB serverless integrations, unlimited habit tracking slots (bypassing the 3-habit free tier limit), and deeper cognitive analysis metrics. You can simulate an upgrade on the **Settings** page!`;
    } else if (lowerMsg.includes('help') || lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('coach')) {
      response = `Hello ${profile.name}! I am your Zen AI Coach. I inspect your habits database to help you maintain consistency.

You can ask me about:
- **"How are my streaks?"** - To analyze your current streak lengths.
- **"What is my progress today?"** - To check your today's score.
- **"Suggest a routine"** - To get structure planning guides.
- **"Tell me about Zen Pro"** - To learn about the monetization tier features.`;
    } else {
      // General feedback based on habits
      if (totalHabits === 0) {
        response = `Welcome to ZenPlan, ${profile.name}! To get started, navigate to the Dashboard page and create your first habit. Once you log your progress, I can give you personalized routine tips.`;
      } else {
        response = `I appreciate your message! Looking at your profile, your daily score is at **${score}%** across **${totalHabits} habits**. Remember that building habits is not about perfection; it is about showing up daily. 

I suggest adding a "Digital Wind Down" habit to keep your sleep patterns consistent. Click below to add it directly!`;

        suggestedHabit = {
          name: 'Digital Wind Down',
          description: 'Turn off screens 45 minutes before bed and stretch.',
          category: 'Health',
          frequency: 'Daily'
        };
      }
    }

    return NextResponse.json({ response, suggestedHabit });
  } catch (error) {
    console.error('API POST chat error:', error);
    return NextResponse.json({ error: 'Failed to process advice' }, { status: 500 });
  }
}
