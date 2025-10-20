import { NextResponse } from 'next/server';
import { ColleagueRequest } from '@/lib/types';

export async function GET() {
  try {
    // TODO: Implement getColleagueRequests helper in Redis
    // For now, return empty array
    const requests: ColleagueRequest[] = [];

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}
