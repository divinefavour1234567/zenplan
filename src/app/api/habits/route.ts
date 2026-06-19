import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const habits = await db.getHabits();
    return NextResponse.json(habits, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('API GET habits error:', error);
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, category, frequency } = body;

    if (!name || !category || !frequency) {
      return NextResponse.json(
        { error: 'Name, category, and frequency are required' },
        { status: 400 }
      );
    }

    const newHabit = await db.addHabit(name, description || '', category, frequency);
    return NextResponse.json(newHabit, { status: 201 });
  } catch (error) {
    console.error('API POST habit error:', error);
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Habit ID is required' }, { status: 400 });
    }

    const deleted = await db.deleteHabit(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('API DELETE habit error:', error);
    return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 });
  }
}
