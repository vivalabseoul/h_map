import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const TOUR_API_BASE = 'https://apis.data.go.kr/B551011';
const PAGE_SIZE = 1000;
const MAX_PAGES = 5;
const DETAIL_CONCURRENCY = 10;
const HANGUL = /[가-힣]/;

// Detail lookups for a few hundred festivals need more than the default function timeout
export const maxDuration = 60;

// Fetch every festival that has not ended yet from the Korea Tourism Organization API
// (KorService2 = Korean, EngService2 = English). Keys can be passed raw or decoded.
async function fetchTourFestivals(service: 'KorService2' | 'EngService2', apiKey: string, eventStartDate: string) {
  const keysToTry = [apiKey, decodeURIComponent(apiKey)];
  let lastError = '';

  for (const key of keysToTry) {
    const collected: any[] = [];
    let totalCount = Infinity;

    for (let pageNo = 1; pageNo <= MAX_PAGES && collected.length < totalCount; pageNo++) {
      const url = `${TOUR_API_BASE}/${service}/searchFestival2?serviceKey=${key}&MobileOS=ETC&MobileApp=handmademap&_type=json&eventStartDate=${eventStartDate}&numOfRows=${PAGE_SIZE}&pageNo=${pageNo}`;
      const text = await (await fetch(url)).text();

      if (!text.startsWith('{')) {
        lastError = text.includes('SERVICE_KEY_IS_NOT_REGISTERED')
          ? '공공데이터포털 API키가 아직 활성화되지 않았거나 (승인 후 최대 1~2시간 소요) 잘못된 인증키입니다.'
          : text.match(/<returnAuthMsg>(.*?)<\/returnAuthMsg>/)?.[1] || '한국관광공사 API 호출 에러가 발생했습니다.';
        break;
      }

      const root = JSON.parse(text)?.response;
      const resultCode = root?.header?.resultCode;
      if (resultCode !== '0000') {
        lastError = `한국관광공사 API 오류 (${resultCode}): ${root?.header?.resultMsg || ''}`;
        break;
      }

      const rawItems = root?.body?.items?.item;
      const pageItems = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];
      if (pageItems.length === 0) break;
      collected.push(...pageItems);
      totalCount = Number(root?.body?.totalCount) || collected.length;
    }

    if (collected.length > 0) return { items: collected, key };
  }

  throw new Error(lastError || '한국관광공사 API에서 축제 데이터를 가져오지 못했습니다. (서비스키 승인 상태를 확인해주세요)');
}

const decodeEntities = (text: string) =>
  text.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&amp;/g, '&');

// Overviews come with <br> tags and entities
const cleanOverview = (html?: string) =>
  decodeEntities((html || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).replace(/\n{3,}/g, '\n\n').trim();

// Homepage is usually a bare URL but sometimes an <a href="..."> snippet
const cleanHomepage = (html?: string) => {
  const url = decodeEntities(html?.match(/href=["']([^"']+)["']/i)?.[1] || (html || '').replace(/<[^>]+>/g, '')).trim();
  if (/^https?:\/\//i.test(url)) return url;
  return /^www\./i.test(url) ? `http://${url}` : '';
};

// Short one-line values (fee, hours, ...) sometimes start with a stray "- " bullet
const cleanLine = (html?: string) => cleanOverview(html).replace(/^-\s*/, '').replace(/\n+/g, ' / ');

async function fetchTourItem(service: 'KorService2' | 'EngService2', endpoint: string, key: string, params: string) {
  const url = `${TOUR_API_BASE}/${service}/${endpoint}?serviceKey=${key}&MobileOS=ETC&MobileApp=handmademap&_type=json&${params}`;
  const item = JSON.parse(await (await fetch(url)).text())?.response?.body?.items?.item;
  return (Array.isArray(item) ? item[0] : item) as any;
}

// Everything the detail endpoints add for one festival, or null when a call failed (so it is retried next sync).
// detailCommon2: overview, homepage. detailIntro2 (festival type 15): fee, hours, venue, organizer.
async function fetchTourDetail(service: 'KorService2' | 'EngService2', key: string, contentId: string) {
  try {
    const common = await fetchTourItem(service, 'detailCommon2', key, `contentId=${contentId}`);
    const intro = service === 'KorService2'
      ? await fetchTourItem(service, 'detailIntro2', key, `contentId=${contentId}&contentTypeId=15`)
      : null;
    return {
      overview: cleanOverview(common?.overview),
      homepage: cleanHomepage(common?.homepage),
      fee: cleanLine(intro?.usetimefestival),
      hours: cleanLine(intro?.playtime),
      venue: cleanLine(intro?.eventplace),
      organizer: cleanLine(intro?.sponsor1),
    };
  } catch {
    return null;
  }
}

type TourDetail = NonNullable<Awaited<ReturnType<typeof fetchTourDetail>>>;

// "20261016" -> "2026-10-16"
const toIsoDate = (yyyymmdd: string) =>
  yyyymmdd && yyyymmdd.length === 8 ? `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}` : '';

const toHttps = (url?: string) => (url ? url.trim().replace(/^http:\/\//, 'https://') : '');

// English titles look like "Andong Maskdance Festival (안동국제탈춤페스티벌)"
const koreanTitleOf = (engTitle: string) => engTitle.match(/\(([^()]*[가-힣][^()]*)\)\s*$/)?.[1]?.replace(/\s+/g, '') || '';
const englishTitleOf = (engTitle: string) => engTitle.replace(/\s*\([^()]*[가-힣][^()]*\)\s*$/, '').trim();

const coordKey = (item: any) => `${item.eventstartdate}|${String(item.mapx).slice(0, 6)}|${String(item.mapy).slice(0, 5)}`;

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
  // In production, allow either the shared secret (for schedulers) or a logged-in admin's token.
  if (process.env.NODE_ENV === 'production') {
    const { searchParams } = new URL(request.url);
    const expectedSecret = process.env.SYNC_SECRET;
    let authorized = Boolean(expectedSecret) && searchParams.get('secret') === expectedSecret;

    if (!authorized) {
      const authHeader = request.headers.get('authorization');
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (authHeader?.startsWith('Bearer ') && anonKey) {
        const { data: { user }, error: verifyError } = await createClient(supabaseUrl, anonKey)
          .auth.getUser(authHeader.slice('Bearer '.length));
        if (!verifyError && user) {
          const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
          authorized = profile?.role === 'super_admin' || profile?.role === 'manager';
        }
      }
    }

    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const apiKey = process.env.FESTIVAL_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: 'FESTIVAL_API_KEY is not configured in environment variables (.env.local)' }, { status: 500 });
  }

  try {
    // 1. Fetch festivals that have not ended yet (today in KST). English data only enriches the Korean ones.
    const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const eventStartDate = today.replace(/-/g, '');

    const { items: korItems, key: tourKey } = await fetchTourFestivals('KorService2', apiKey, eventStartDate);
    const engItems = await fetchTourFestivals('EngService2', apiKey, eventStartDate).then((result) => result.items).catch(() => [] as any[]);

    const items = korItems.filter((item) => {
      const lastDay = toIsoDate(item.eventenddate) || toIsoDate(item.eventstartdate);
      return lastDay !== '' && lastDay >= today;
    });

    // 2. Pair each English entry with its Korean one (by Korean title in parentheses, else start date + coordinates)
    const korByName = new Map(korItems.map((item) => [String(item.title).replace(/\s+/g, ''), item.contentid]));
    const korByCoord = new Map(korItems.map((item) => [coordKey(item), item.contentid]));
    const englishById = new Map<string, { contentId: string; name: string; address: string }>();
    for (const eng of engItems) {
      const contentId = korByName.get(koreanTitleOf(String(eng.title))) ?? korByCoord.get(coordKey(eng));
      const name = englishTitleOf(String(eng.title));
      if (!contentId || !name || HANGUL.test(name)) continue;
      englishById.set(contentId, { contentId: eng.contentid, name, address: HANGUL.test(eng.addr1 || '') ? '' : (eng.addr1 || '') });
    }

    // Fetch a valid user to satisfy the foreign key constraint
    const { data: adminUser } = await supabase.from('users').select('id').limit(1).single();
    const validCreatorId = adminUser ? adminUser.id : '00000000-0000-0000-0000-000000000000';

    // 3. Load what already exists so new festivals are never duplicated and old ones can get images
    const existingRows: any[] = [];
    for (let from = 0; ; from += 1000) {
      const { data: rows, error: existingError } = await supabase
        .from('flea_markets')
        .select('id, external_id, name, address, description, website, admission_fee, venue_name, date, lat, lng, poster_url, images, source')
        .range(from, from + 999);
      if (existingError) throw existingError;
      if (!rows || rows.length === 0) break;
      existingRows.push(...rows);
      if (rows.length < 1000) break;
    }

    // Auto-synced festivals that have already ended are removed (user-created ones are never touched)
    const expiredIds: string[] = [];
    for (let i = existingRows.length - 1; i >= 0; i--) {
      const row = existingRows[i];
      const lastDay = String(row.date || '').trim().slice(-10);
      if (row.source === 'api' && /^\d{4}-\d{2}-\d{2}$/.test(lastDay) && lastDay < today) {
        expiredIds.push(row.id);
        existingRows.splice(i, 1);
      }
    }
    for (let i = 0; i < expiredIds.length; i += 100) {
      const { error: deleteError } = await supabase.from('flea_markets').delete().in('id', expiredIds.slice(i, i + 100));
      if (deleteError) throw deleteError;
    }

    const keyOf = (name: string, date: string) => `${name.replace(/\s+/g, '')}|${date.trim()}`;
    const rowByExternalId = new Map<string, any>();
    const rowByNameDate = new Map<string, any>();
    const rowsByStart = new Map<string, any[]>();
    for (const row of existingRows) {
      if (row.external_id) rowByExternalId.set(row.external_id, row);
      if (row.name?.ko && row.date) rowByNameDate.set(keyOf(row.name.ko, row.date), row);
      const start = String(row.date || '').slice(0, 10);
      rowsByStart.set(start, [...(rowsByStart.get(start) || []), row]);
    }
    const findNearby = (start: string, lat: number, lng: number) =>
      rowsByStart.get(start)?.find((row) => Math.abs(row.lat - lat) < 0.005 && Math.abs(row.lng - lng) < 0.005);

    let skippedDuplicates = 0;
    let skippedNoCoords = 0;
    const toInsert: any[] = [];
    const candidateUpdates: { id: string; data: Record<string, any> }[] = [];
    // Description, homepage, fee, hours, venue and organizer come from per-festival detail calls,
    // only made for festivals that have not been enriched yet (venue_name stays null until then)
    const detailJobs: {
      contentId: string;
      engContentId?: string;
      apply: (ko: TourDetail, en: TourDetail | null) => void;
    }[] = [];

    // 4. New festivals are inserted; existing api festivals only get the fields they are missing
    for (const item of items) {
      const lat = parseFloat(item.mapy);
      const lng = parseFloat(item.mapx);
      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
        skippedNoCoords++;
        continue;
      }

      const title = String(item.title || 'Unnamed Festival').trim();
      const startDate = toIsoDate(item.eventstartdate);
      const endDate = toIsoDate(item.eventenddate);
      const dateStr = !endDate || startDate === endDate ? startDate : `${startDate} ~ ${endDate}`;
      const english = englishById.get(item.contentid);

      // Use the API's own sizes as-is: ~15KB thumbnail (300x200) for lists, ~100KB original (940x626) for the detail page
      const thumbnail = toHttps(item.firstimage2) || toHttps(item.firstimage);
      const detailImage = toHttps(item.firstimage);

      const externalId = `tour_${item.contentid}`;
      const existing = rowByExternalId.get(externalId)
        || rowByNameDate.get(keyOf(title, dateStr))
        || findNearby(startDate, lat, lng);

      if (existing) {
        const update: Record<string, any> = {};
        if (existing.source === 'api') {
          if (!existing.poster_url && thumbnail) {
            update.poster_url = thumbnail;
            update.images = detailImage ? [detailImage] : [];
          }
          if (!existing.name?.en && english?.name) update.name = { ...existing.name, en: english.name };
          if (!existing.address?.en && english?.address) update.address = { ...existing.address, en: english.address };
        }
        if (existing.source === 'api' && (existing.venue_name == null || !existing.description?.ko)) {
          detailJobs.push({
            contentId: item.contentid,
            engContentId: english?.contentId,
            apply: (ko, en) => {
              if (!existing.description?.ko && ko.overview) {
                update.description = { ...existing.description, ko: ko.overview, en: existing.description?.en || en?.overview || '' };
              }
              if (!existing.website && ko.homepage) update.website = ko.homepage;
              if ((!existing.admission_fee || existing.admission_fee === '확인 필요') && ko.fee) update.admission_fee = ko.fee;
              update.venue_name = ko.venue;
              update.operating_hours = ko.hours;
              update.organizer = ko.organizer;
            },
          });
        }
        candidateUpdates.push({ id: existing.id, data: update });
        continue;
      }

      const newRow = {
        creator_id: validCreatorId,
        creator_name: '지역 축제 알리미',
        name: { ko: title, en: english?.name || '', ja: '', zh: '' },
        date: dateStr,
        address: { ko: [item.addr1, item.addr2].filter(Boolean).join(' ') || '주소 미상', en: english?.address || '', ja: '', zh: '' },
        lat,
        lng,
        admission_fee: '확인 필요',
        venue_name: null as string | null,
        operating_hours: '',
        organizer: '',
        poster_url: thumbnail || null,
        images: detailImage ? [detailImage] : [],
        description: { ko: '', en: '', ja: '', zh: '' },
        phone: item.tel || '',
        website: '',
        source: 'api',
        external_id: externalId,
      };
      rowByExternalId.set(externalId, newRow);
      toInsert.push(newRow);
      detailJobs.push({
        contentId: item.contentid,
        engContentId: english?.contentId,
        apply: (ko, en) => {
          newRow.description = { ...newRow.description, ko: ko.overview, en: en?.overview || '' };
          newRow.website = ko.homepage;
          if (ko.fee) newRow.admission_fee = ko.fee;
          newRow.venue_name = ko.venue;
          newRow.operating_hours = ko.hours;
          newRow.organizer = ko.organizer;
        },
      });
    }

    for (let i = 0; i < detailJobs.length; i += DETAIL_CONCURRENCY) {
      await Promise.all(
        detailJobs.slice(i, i + DETAIL_CONCURRENCY).map(async (job) => {
          const [ko, en] = await Promise.all([
            fetchTourDetail('KorService2', tourKey, job.contentId),
            job.engContentId ? fetchTourDetail('EngService2', tourKey, job.engContentId) : null,
          ]);
          if (ko) job.apply(ko, en);
        })
      );
    }

    const toUpdate = candidateUpdates.filter(({ data }) => Object.keys(data).length > 0);
    skippedDuplicates = candidateUpdates.length - toUpdate.length;

    let insertedCount = 0;
    for (let i = 0; i < toInsert.length; i += 100) {
      const chunk = toInsert.slice(i, i + 100);
      const { error: insertError } = await supabase.from('flea_markets').insert(chunk);
      if (insertError) throw insertError;
      insertedCount += chunk.length;
    }

    for (let i = 0; i < toUpdate.length; i += 20) {
      const results = await Promise.all(
        toUpdate.slice(i, i + 20).map(({ id, data }) => supabase.from('flea_markets').update(data).eq('id', id))
      );
      const failed = results.find((result) => result.error);
      if (failed?.error) throw failed.error;
    }

    return NextResponse.json({
      success: true,
      message: `${insertedCount}개의 새 축제를 추가하고, 기존 ${toUpdate.length}개에 이미지/영문 정보를 채웠습니다. 지난 축제 ${expiredIds.length}개는 삭제했습니다. (${skippedDuplicates}개는 그대로 유지)`,
      totalFetched: korItems.length,
      upcoming: items.length,
      inserted: insertedCount,
      updated: toUpdate.length,
      deleted: expiredIds.length,
      skippedDuplicates,
      skippedNoCoords,
    });

  } catch (error: any) {
    console.error('Festival API Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
