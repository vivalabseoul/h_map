import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// We use the service role key to bypass RLS for background syncing, 
// or standard key if RLS allows inserts for admin.
// For simplicity in MVP, we will just use standard supabase client assuming auth or we disable RLS for 'api' source.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  // Optional: check a secret token in the URL to prevent unauthorized syncs
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (secret !== process.env.SYNC_SECRET && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.FESTIVAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'FESTIVAL_API_KEY is not configured in environment variables' }, { status: 500 });
  }

  try {
    // 1. Fetch data from the public API
    // type=json is important for the response format
    const apiUrl = `https://api.data.go.kr/openapi/tn_pubr_public_cltur_fstvl_api?serviceKey=${apiKey}&pageNo=1&numOfRows=100&type=json`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API fetch failed with status ${response.status}`);
    }

    const json = await response.json();
    const items = json?.response?.body?.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'No items found from the API' });
    }

    // Fetch a valid user to satisfy the foreign key constraint
    const { data: adminUser } = await supabase.from('users').select('id').limit(1).single();
    const validCreatorId = adminUser ? adminUser.id : '00000000-0000-0000-0000-000000000000';

    let syncedCount = 0;

    // 2. Process and insert/upsert into Supabase
    for (const item of items) {
      // Validate coordinates
      const lat = parseFloat(item.latitude);
      const lng = parseFloat(item.longitude);
      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) continue; // Skip invalid locations

      const fstvlNm = item.fstvlNm || 'Unnamed Festival';
      const startDate = item.fstvlStartDate || '';
      const endDate = item.fstvlEndDate || '';
      const dateStr = startDate === endDate ? startDate : `${startDate} ~ ${endDate}`;
      const addressStr = item.rdnmadr || item.lnmadr || item.opar || '주소 미상';
      const descriptionStr = item.fstvlCo || item.mnnstNm || '';

      // Create a unique external ID based on name and start date
      const externalId = `festival_${fstvlNm}_${startDate}`;

      const insertData = {
        creator_id: validCreatorId,
        creator_name: '지역 축제 알리미',
        name: { ko: fstvlNm, en: '', ja: '', zh: '' },
        date: dateStr,
        address: { ko: addressStr, en: '', ja: '', zh: '' },
        lat: lat,
        lng: lng,
        admission_fee: '확인 필요',
        images: [],
        description: { ko: descriptionStr, en: '', ja: '', zh: '' },
        phone: item.phoneNumber || '',
        website: item.homepageUrl || '',
        source: 'api',
        external_id: externalId,
      };

      // Check if it already exists (to avoid duplicates if we don't have a strict upsert constraint)
      const { data: existing } = await supabase
        .from('flea_markets')
        .select('id')
        .eq('external_id', externalId)
        .single();

      if (existing) {
        // Update existing
        const { error: updateError } = await supabase
          .from('flea_markets')
          .update(insertData)
          .eq('id', existing.id);
        if (updateError) throw updateError;
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('flea_markets')
          .insert([insertData]);
        if (insertError) throw insertError;
      }
      
      syncedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${syncedCount} festivals.`,
      totalFetched: items.length
    });

  } catch (error: any) {
    console.error('Festival API Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
