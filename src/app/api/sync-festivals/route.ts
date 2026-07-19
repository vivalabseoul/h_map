import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // We use the service role key to bypass RLS for background syncing, 
  // or standard key if RLS allows inserts for admin.
  // For simplicity in MVP, we will just use standard supabase client assuming auth or we disable RLS for 'api' source.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase credentials are not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  // Optional: check a secret token in the URL to prevent unauthorized syncs
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (secret !== process.env.SYNC_SECRET && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.FESTIVAL_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: 'FESTIVAL_API_KEY is not configured in environment variables (.env.local)' }, { status: 500 });
  }

  try {
    // 1. Fetch data from the public API
    // Public Data Portal API keys can be passed as raw string or decoded string
    const keysToTry = [apiKey, decodeURIComponent(apiKey)];
    let items: any[] = [];
    let fetchErrorMsg = '';

    for (const keyCandidate of keysToTry) {
      try {
        const apiUrl = `https://api.data.go.kr/openapi/tn_pubr_public_cltur_fstvl_api?serviceKey=${keyCandidate}&pageNo=1&numOfRows=100&type=json`;
        const response = await fetch(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*'
          }
        });
        const text = await response.text();

        if (text.startsWith('{')) {
          const json = JSON.parse(text);
          const fetchedItems = json?.response?.body?.items || [];
          if (Array.isArray(fetchedItems) && fetchedItems.length > 0) {
            items = fetchedItems;
            break; // Success!
          }
        } else if (text.includes('SERVICE_KEY_IS_NOT_REGISTERED')) {
          fetchErrorMsg = '공공데이터포털 API키가 아직 활성화되지 않았거나 (승인 후 최대 1~2시간 소요) 잘못된 인증키입니다.';
        } else if (text.includes('<returnReasonCode>')) {
          const match = text.match(/<returnAuthMsg>(.*?)<\/returnAuthMsg>/);
          fetchErrorMsg = match ? match[1] : '공공데이터포털 API 호출 에러가 발생했습니다.';
        }
      } catch (err: any) {
        fetchErrorMsg = err.message;
      }
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ 
        error: fetchErrorMsg || '공공데이터포털 API에서 축제 데이터를 가져오지 못했습니다. (서비스키 승인 상태를 확인해주세요)' 
      }, { status: 500 });
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
