import { NextResponse } from 'next/server';
import { getCaller, isAdminRole, rateLimit } from '@/lib/serverAuth';

export async function POST(request: Request) {
  const caller = await getCaller(request);
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isAdminRole(caller.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!rateLimit(`places:${caller.id}`, 30, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { query, languageCode } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GOOGLE_MAPS_API_KEY is not configured in .env.local' }, { status: 500 });
    }

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.internationalPhoneNumber,places.websiteUri,places.photos',
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: languageCode || 'en',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google API Error:', errorText);
      return NextResponse.json({ error: 'Failed to fetch from Google Places API' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
