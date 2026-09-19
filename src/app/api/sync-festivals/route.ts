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
    // 1. Fetch every page from the public API (keys can be passed raw or decoded)
    const keysToTry = [apiKey, decodeURIComponent(apiKey)];
    const PAGE_SIZE = 1000;
    const MAX_PAGES = 10;
    let allItems: any[] = [];
    let fetchErrorMsg = '';

    for (const keyCandidate of keysToTry) {
      try {
        const collected: any[] = [];
        let totalCount = Infinity;

        for (let pageNo = 1; pageNo <= MAX_PAGES && collected.length < totalCount; pageNo++) {
          const apiUrl = `https://api.data.go.kr/openapi/tn_pubr_public_cltur_fstvl_api?serviceKey=${keyCandidate}&pageNo=${pageNo}&numOfRows=${PAGE_SIZE}&type=json`;
          const response = await fetch(apiUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/json, text/plain, */*'
            }
          });
          const text = await response.text();

          if (text.startsWith('{')) {
            const json = JSON.parse(text);
            // The API returns either { response: { header, body } } or { header, body } directly,
            // and body.items is either an array or { item: [...] | {...} }.
            const root = json?.response ?? json;
            const rawItems = root?.body?.items;
            const pageItems = Array.isArray(rawItems)
              ? rawItems
              : Array.isArray(rawItems?.item)
                ? rawItems.item
                : rawItems?.item
                  ? [rawItems.item]
                  : [];
            const resultCode = root?.header?.resultCode;
            if (pageItems.length === 0) {
              if (resultCode && resultCode !== '00') {
                fetchErrorMsg = `공공데이터포털 API 오류 (${resultCode}): ${root?.header?.resultMsg || ''}`;
              }
              break;
            }
            collected.push(...pageItems);
            totalCount = Number(root?.body?.totalCount) || collected.length;
          } else if (text.includes('SERVICE_KEY_IS_NOT_REGISTERED')) {
            fetchErrorMsg = '공공데이터포털 API키가 아직 활성화되지 않았거나 (승인 후 최대 1~2시간 소요) 잘못된 인증키입니다.';
            break;
          } else if (text.includes('<returnReasonCode>')) {
            const match = text.match(/<returnAuthMsg>(.*?)<\/returnAuthMsg>/);
            fetchErrorMsg = match ? match[1] : '공공데이터포털 API 호출 에러가 발생했습니다.';
            break;
          } else {
            break;
          }
        }

        if (collected.length > 0) {
          allItems = collected;
          break; // Success!
        }
      } catch (err: any) {
        fetchErrorMsg = err.message;
      }
    }

    if (allItems.length === 0) {
      return NextResponse.json({
        error: fetchErrorMsg || '공공데이터포털 API에서 축제 데이터를 가져오지 못했습니다. (서비스키 승인 상태를 확인해주세요)'
      }, { status: 500 });
    }

    // 2. First-pass filter: keep only festivals that have not ended yet (today in KST)
    const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const items = allItems.filter((item) => {
      const lastDay = item.fstvlEndDate || item.fstvlStartDate || '';
      return lastDay !== '' && lastDay >= today;
    });

    // Fetch a valid user to satisfy the foreign key constraint
    const { data: adminUser } = await supabase.from('users').select('id').limit(1).single();
    const validCreatorId = adminUser ? adminUser.id : '00000000-0000-0000-0000-000000000000';

    // 3. Load what already exists so we never overwrite or duplicate it
    const existingIds = new Set<string>();
    const existingKeys = new Set<string>();
    const keyOf = (name: string, date: string) => `${name.trim()}|${date.trim()}`;
    for (let from = 0; ; from += 1000) {
      const { data: rows, error: existingError } = await supabase
        .from('flea_markets')
        .select('external_id, name, date')
        .range(from, from + 999);
      if (existingError) throw existingError;
      if (!rows || rows.length === 0) break;
      for (const row of rows) {
        if (row.external_id) existingIds.add(row.external_id);
        const ko = row.name?.ko;
        if (ko && row.date) existingKeys.add(keyOf(ko, row.date));
      }
      if (rows.length < 1000) break;
    }

    let insertedCount = 0;
    let skippedDuplicates = 0;
    let skippedNoCoords = 0;
    const toInsert: any[] = [];

    // 4. Build rows for festivals that are new; existing ones are left untouched
    for (const item of items) {
      // Validate coordinates
      const lat = parseFloat(item.latitude);
      const lng = parseFloat(item.longitude);
      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
        skippedNoCoords++;
        continue; // Skip invalid locations
      }

      const fstvlNm = item.fstvlNm || 'Unnamed Festival';
      const startDate = item.fstvlStartDate || '';
      const endDate = item.fstvlEndDate || '';
      const dateStr = startDate === endDate ? startDate : `${startDate} ~ ${endDate}`;
      const addressStr = item.rdnmadr || item.lnmadr || item.opar || '주소 미상';
      const descriptionStr = item.fstvlCo || item.mnnstNm || '';

      // Create a unique external ID based on name and start date
      const externalId = `festival_${fstvlNm}_${startDate}`;
      const nameDateKey = keyOf(fstvlNm, dateStr);

      if (existingIds.has(externalId) || existingKeys.has(nameDateKey)) {
        skippedDuplicates++;
        continue;
      }
      existingIds.add(externalId);
      existingKeys.add(nameDateKey);

      toInsert.push({
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
      });
    }

    for (let i = 0; i < toInsert.length; i += 100) {
      const chunk = toInsert.slice(i, i + 100);
      const { error: insertError } = await supabase.from('flea_markets').insert(chunk);
      if (insertError) throw insertError;
      insertedCount += chunk.length;
    }

    return NextResponse.json({
      success: true,
      message: `${insertedCount}개의 새 축제를 추가했습니다. (기존 ${skippedDuplicates}개는 유지)`,
      totalFetched: allItems.length,
      upcoming: items.length,
      inserted: insertedCount,
      skippedDuplicates,
      skippedNoCoords,
    });

  } catch (error: any) {
    console.error('Festival API Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
