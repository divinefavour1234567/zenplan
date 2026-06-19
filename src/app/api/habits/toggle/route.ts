import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, date } = body;

    if (!id || !date) {
      return NextResponse.json({ error: 'Habit ID and date are required' }, { status: 400 });
    }

    const updatedHabit = await db.toggleHabitDay(id, date);
    if (!updatedHabit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json(updatedHabit);
  } catch (error) {
    console.error('API POST toggle habit error:', error);
    return NextResponse.json({ error: 'Failed to toggle habit completion' }, { status: 500 });
  }
}
