import type { Locale } from '@/types';

export interface KoreaRegion {
  // Korean short name, e.g. '서울'. It is the only identity used for grouping; other languages just label it.
  key: string;
  label: Record<Locale, string>;
  koNames: string[];
  enPattern: RegExp;
}

export const KOREA_REGIONS: KoreaRegion[] = [
  { key: '서울', label: { ko: '서울', en: 'Seoul', ja: 'ソウル', zh: '首尔' }, koNames: ['서울', '서울특별시', '서울시'], enPattern: /seoul/g },
  { key: '경기', label: { ko: '경기', en: 'Gyeonggi', ja: '京畿道', zh: '京畿道' }, koNames: ['경기', '경기도'], enPattern: /gyeonggi/g },
  { key: '인천', label: { ko: '인천', en: 'Incheon', ja: '仁川', zh: '仁川' }, koNames: ['인천', '인천광역시', '인천시'], enPattern: /incheon/g },
  { key: '부산', label: { ko: '부산', en: 'Busan', ja: '釜山', zh: '釜山' }, koNames: ['부산', '부산광역시', '부산시'], enPattern: /busan/g },
  { key: '대구', label: { ko: '대구', en: 'Daegu', ja: '大邱', zh: '大邱' }, koNames: ['대구', '대구광역시', '대구시'], enPattern: /daegu/g },
  { key: '대전', label: { ko: '대전', en: 'Daejeon', ja: '大田', zh: '大田' }, koNames: ['대전', '대전광역시', '대전시'], enPattern: /daejeon/g },
  { key: '울산', label: { ko: '울산', en: 'Ulsan', ja: '蔚山', zh: '蔚山' }, koNames: ['울산', '울산광역시', '울산시'], enPattern: /ulsan/g },
  { key: '세종', label: { ko: '세종', en: 'Sejong', ja: '世宗', zh: '世宗' }, koNames: ['세종', '세종특별자치시', '세종시'], enPattern: /sejong/g },
  { key: '제주', label: { ko: '제주', en: 'Jeju', ja: '済州', zh: '济州' }, koNames: ['제주', '제주특별자치도', '제주도', '제주시'], enPattern: /jeju/g },
  { key: '강원', label: { ko: '강원', en: 'Gangwon', ja: '江原道', zh: '江原道' }, koNames: ['강원', '강원도', '강원특별자치도'], enPattern: /gangwon/g },
  { key: '충북', label: { ko: '충북', en: 'Chungbuk', ja: '忠清北道', zh: '忠清北道' }, koNames: ['충북', '충청북도'], enPattern: /chungcheongbuk|chungbuk|north chungcheong/g },
  { key: '충남', label: { ko: '충남', en: 'Chungnam', ja: '忠清南道', zh: '忠清南道' }, koNames: ['충남', '충청남도'], enPattern: /chungcheongnam|chungnam|south chungcheong/g },
  { key: '전북', label: { ko: '전북', en: 'Jeonbuk', ja: '全羅北道', zh: '全罗北道' }, koNames: ['전북', '전라북도', '전북특별자치도'], enPattern: /jeollabuk|jeonbuk|north jeolla/g },
  // Gwangju and Jeonnam were merged into one special city; old and new addresses all land in the same group
  { key: '전남광주', label: { ko: '전남광주', en: 'Jeonnam-Gwangju', ja: '全羅南道・光州', zh: '全罗南道・光州' }, koNames: ['전남광주', '전남광주통합특별시', '광주', '광주광역시', '광주시', '전남', '전라남도'], enPattern: /jeollanam|jeonnam|south jeolla|gwangju/g },
  { key: '경북', label: { ko: '경북', en: 'Gyeongbuk', ja: '慶尚北道', zh: '庆尚北道' }, koNames: ['경북', '경상북도'], enPattern: /gyeongsangbuk|gyeongbuk|north gyeongsang/g },
  { key: '경남', label: { ko: '경남', en: 'Gyeongnam', ja: '慶尚南道', zh: '庆尚南道' }, koNames: ['경남', '경상남도'], enPattern: /gyeongsangnam|gyeongnam|south gyeongsang/g },
];

const HANGUL = /[가-힣]/;

function fromKorean(address: string): KoreaRegion | null {
  const tokens = address.trim().split(/\s+/).filter((token) => token !== '대한민국' && token !== '한국');
  return KOREA_REGIONS.find((region) => region.koNames.includes(tokens[0])) ?? null;
}

// English addresses run small to large ("..., Gwangju-si, Gyeonggi-do"), so the province is the last one mentioned
function fromEnglish(address: string): KoreaRegion | null {
  const text = address.toLowerCase();
  let best: { region: KoreaRegion; index: number } | null = null;
  for (const region of KOREA_REGIONS) {
    for (const match of text.matchAll(region.enPattern)) {
      if (!best || match.index > best.index) best = { region, index: match.index };
    }
  }
  return best?.region ?? null;
}

// The Korean address decides the region whenever there is one, so grouping never depends on the UI language.
// Other languages' addresses are only a fallback for items that have no Korean address.
export function getKoreaRegion(address: Partial<Record<Locale, string>> | string | null | undefined): KoreaRegion | null {
  if (!address) return null;
  const texts = typeof address === 'string' ? [address] : [address.ko, address.en, address.ja, address.zh];
  const filled = texts.filter((text): text is string => Boolean(text && text.trim()));

  for (const text of filled) {
    if (HANGUL.test(text)) {
      const region = fromKorean(text);
      if (region) return region;
    }
  }
  for (const text of filled) {
    const region = fromEnglish(text);
    if (region) return region;
  }
  return null;
}

// "제주", "Jeju", "済州" and "济州" all point to the same region, so a search by region name works in any language
export function findKoreaRegionByQuery(query: string): KoreaRegion | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  return (
    KOREA_REGIONS.find(
      (region) => region.koNames.includes(q) || Object.values(region.label).some((label) => label.toLowerCase() === q),
    ) ?? null
  );
}
