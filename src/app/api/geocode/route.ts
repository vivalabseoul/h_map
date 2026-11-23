import { NextResponse } from 'next/server';
import { getCaller, rateLimit } from '@/lib/serverAuth';

const ALLOWED_ROLES = ['super_admin', 'manager', 'instructor', 'market_coordinator'];

export async function GET(request: Request) {
  // Only people who register places need geocoding; keeps the Google quota from being abused.
  const caller = await getCaller(request);
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!ALLOWED_ROLES.includes(caller.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!rateLimit(`geocode:${caller.id}`, 30, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Geocoding API key not configured' }, { status: 500 });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}&language=ko`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return NextResponse.json({ lat: location.lat, lng: location.lng });
    } else {
      console.error('Geocoding failed:', data.status, data.error_message);
      return NextResponse.json({ error: 'No results found', status: data.status }, { status: 404 });
    }
  } catch (error) {
    console.error('Error during geocoding:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
