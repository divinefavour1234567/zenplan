import { NextResponse } from 'next/server';
import { db, isDynamoConfigured } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const profile = await db.getProfile();
    return NextResponse.json({
      ...profile,
      dbMode: isDynamoConfigured ? 'Amazon DynamoDB' : 'Local File Simulator',
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('API GET profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, isPremium } = body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (isPremium !== undefined) {
      updates.isPremium = isPremium;
      updates.premiumSince = isPremium ? new Date().toISOString() : null;
    }

    const updatedProfile = await db.updateProfile(updates);
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('API POST profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
