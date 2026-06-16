import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials. Make sure to run with --env-file=.env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const MOCK_DATA = [
  {
    ownerName: "Seoul Ceramic Art",
    name: { ko: "서울 세라믹 아트", en: "Seoul Ceramic Art", ja: "ソウルセラミックアート", zh: "首尔陶瓷艺术" },
    category: "pottery",
    description: { ko: "서울 도심 속에서 물레를 돌리며 힐링하는 시간.", en: "Healing time spinning a pottery wheel in downtown Seoul.", ja: "ソウル都心でろくろを回しながら癒される時間。", zh: "在首尔市中心转动陶轮治愈的时间。" },
    address: { ko: "서울 마포구 서교동 12-3", en: "12-3 Seogyo-dong, Mapo-gu, Seoul", ja: "ソウル特別市 麻浦区 西橋洞 12-3", zh: "首尔特别市麻浦区西桥洞12-3" },
    lat: 37.555, lng: 126.920,
    region: "korea", phone: "010-1111-2222", website: "https://example.com/sca",
    images: ["https://fjwyzhvuskciecqlmcep.supabase.co/storage/v1/object/public/images/workshops/1781496390118_5s1krgm.jpg"],
    languages: ["Korean", "English"],
    snsLinks: { instagram: "https://instagram.com/seoul_ceramic" },
    tags: ["Beginner_Friendly", "city:Seoul", "district:Mapo-gu", "suburb:Seogyo-dong"]
  },
  {
    ownerName: "Busan Woodcraft",
    name: { ko: "부산 달맞이 목공방", en: "Busan Dalmaji Woodcraft", ja: "釜山タルマジ木工房", zh: "釜山迎月木作工坊" },
    category: "woodworking",
    description: { ko: "해운대 바다를 보며 나만의 도마 만들기.", en: "Making your own cutting board while looking at the Haeundae sea.", ja: "海雲台の海を見ながら自分だけのまな板作り。", zh: "边看海云台海边做属于自己的案板。" },
    address: { ko: "부산 해운대구 중동 14-5", en: "14-5 Jung-dong, Haeundae-gu, Busan", ja: "釜山広域市 海雲台区 中洞 14-5", zh: "釜山广域市海云台区中洞14-5" },
    lat: 35.158, lng: 129.170,
    region: "korea", phone: "051-222-3333", website: "https://example.com/bwc",
    images: ["https://fjwyzhvuskciecqlmcep.supabase.co/storage/v1/object/public/images/workshops/1781496390118_5s1krgm.jpg"],
    languages: ["Korean"],
    snsLinks: { instagram: "https://instagram.com/busan_wood" },
    tags: ["1_Hour_Class", "city:Busan", "district:Haeundae-gu", "suburb:Jung-dong"]
  },
  {
    ownerName: "Jeju Sea Candle",
    name: { ko: "제주 바다 캔들", en: "Jeju Sea Candle", ja: "済州海キャンドル", zh: "济州海蜡烛" },
    category: "candle",
    description: { ko: "제주 조개껍질을 활용한 바다 캔들 원데이 클래스.", en: "Ocean candle one-day class using Jeju seashells.", ja: "済州の貝殻を活用した海キャンドルワンデイクラス。", zh: "利用济州贝壳的海洋蜡烛一日课程。" },
    address: { ko: "제주 서귀포시 안덕면 사계리 55", en: "55 Sagye-ri, Andeok-myeon, Seogwipo-si, Jeju", ja: "済州特別自治道 西帰浦市 安徳面 沙渓里 55", zh: "济州特别自治道西归浦市安德面沙溪里55" },
    lat: 33.238, lng: 126.315,
    region: "korea", phone: "064-333-4444", website: "https://example.com/jeju_candle",
    images: ["https://fjwyzhvuskciecqlmcep.supabase.co/storage/v1/object/public/images/workshops/1781496390118_5s1krgm.jpg"],
    languages: ["Korean", "English", "Japanese", "Chinese"],
    snsLinks: { instagram: "https://instagram.com/jeju_sea_candle" },
    tags: ["Global_Shipping", "city:Jeju-do", "district:Seogwipo-si", "suburb:Andeok-myeon"]
  },
  {
    ownerName: "Daegu Leather",
    name: { ko: "대구 수제 가죽공방", en: "Daegu Handmade Leather", ja: "大邱手作りレザー工房", zh: "大邱手工皮革工坊" },
    category: "leather",
    description: { ko: "가죽 공예 기초부터 심화까지 배울 수 있는 곳.", en: "A place where you can learn leather crafts from basics to advanced.", ja: "レザークラフトの基礎から深化まで学べる場所。", zh: "在这里您可以学习从基础到高级的皮革工艺。" },
    address: { ko: "대구 중구 동성로 12", en: "12 Dongseong-ro, Jung-gu, Daegu", ja: "大邱広域市 中区 東城路 12", zh: "大邱广域市中区东城路12" },
    lat: 35.871, lng: 128.593,
    region: "korea", phone: "053-444-5555", website: "https://example.com/daegu_leather",
    images: ["https://fjwyzhvuskciecqlmcep.supabase.co/storage/v1/object/public/images/workshops/1781496390118_5s1krgm.jpg"],
    languages: ["Korean"],
    snsLinks: { instagram: "https://instagram.com/daegu_leather" },
    tags: ["Beginner_Friendly", "city:Daegu", "district:Jung-gu", "suburb:Dongseong-ro"]
  },
  {
    ownerName: "Gwangju Cooking",
    name: { ko: "광주 남도 요리교실", en: "Gwangju Namdo Cooking Class", ja: "光州南道料理教室", zh: "光州南道烹饪班" },
    category: "cooking",
    description: { ko: "맛의 고장 광주에서 남도 전통 요리 배우기.", en: "Learn traditional Namdo cooking in Gwangju, the city of flavor.", ja: "味の故郷・光州で南道の伝統料理を学ぶ。", zh: "在美食之都光州学习传统的南道烹饪。" },
    address: { ko: "광주 동구 금남로 33", en: "33 Geumnam-ro, Dong-gu, Gwangju", ja: "光州広域市 東区 錦南路 33", zh: "光州广域市东区锦南路33" },
    lat: 35.149, lng: 126.919,
    region: "korea", phone: "062-555-6666", website: "https://example.com/gwangju_cook",
    images: ["https://fjwyzhvuskciecqlmcep.supabase.co/storage/v1/object/public/images/workshops/1781496390118_5s1krgm.jpg"],
    languages: ["Korean", "English"],
    snsLinks: { instagram: "https://instagram.com/gwangju_cooking" },
    tags: ["Group_Discount", "city:Gwangju", "district:Dong-gu", "suburb:Geumnam-ro"]
  },
  {
    ownerName: "Daejeon Baking",
    name: { ko: "대전 성심 베이킹", en: "Daejeon Sungsim Baking", ja: "大田聖心ベーキング", zh: "大田圣心烘焙" },
    category: "baking",
    description: { ko: "대전의 명물 빵을 내 손으로 직접 굽는 클래스.", en: "A class where you bake Daejeon's famous bread with your own hands.", ja: "大田の名物パンを自分の手で直接焼くクラス。", zh: "亲手烘烤大田著名面包的课程。" },
    address: { ko: "대전 중구 은행동 1-1", en: "1-1 Eunhaeng-dong, Jung-gu, Daejeon", ja: "大田広域市 中区 銀行洞 1-1", zh: "大田广域市中区银行洞1-1" },
    lat: 36.328, lng: 127.426,
    region: "korea", phone: "042-666-7777", website: "https://example.com/daejeon_baking",
    images: ["https://fjwyzhvuskciecqlmcep.supabase.co/storage/v1/object/public/images/workshops/1781496390118_5s1krgm.jpg"],
    languages: ["Korean"],
    snsLinks: { instagram: "https://instagram.com/daejeon_baking" },
    tags: ["city:Daejeon", "district:Jung-gu", "suburb:Eunhaeng-dong"]
  },
  {
    ownerName: "Incheon Perfume",
    name: { ko: "인천 송도 향수공방", en: "Incheon Songdo Perfume", ja: "仁川松島香水工房", zh: "仁川松岛香水工坊" },
    category: "perfume",
    description: { ko: "조향사와 함께 나만의 니치 향수 만들기.", en: "Make your own niche perfume with a perfumer.", ja: "調香師と一緒に自分だけのニッチ香水作り。", zh: "与调香师一起调制属于自己的小众香水。" },
    address: { ko: "인천 연수구 송도동 22-1", en: "22-1 Songdo-dong, Yeonsu-gu, Incheon", ja: "仁川広域市 延寿区 松島洞 22-1", zh: "仁川广域市延寿区松岛洞22-1" },
    lat: 37.382, lng: 126.638,
    region: "korea", phone: "032-777-8888", website: "https://example.com/incheon_perfume",
    images: ["https://fjwyzhvuskciecqlmcep.supabase.co/storage/v1/object/public/images/workshops/1781496390118_5s1krgm.jpg"],
    languages: ["Korean", "English", "Chinese"],
    snsLinks: { instagram: "https://instagram.com/songdo_perfume" },
    tags: ["English_Spoken", "city:Incheon", "district:Yeonsu-gu", "suburb:Songdo-dong"]
  },
  {
    ownerName: "Ulsan Textile",
    name: { ko: "울산 태화강 위빙 공방", en: "Ulsan Taehwagang Weaving", ja: "蔚山太和江ウィービング工房", zh: "蔚山太和江编织工坊" },
    category: "textile",
    description: { ko: "태화강 십리대숲을 보며 즐기는 감성 위빙 클래스.", en: "Emotional weaving class enjoying the view of Taehwagang bamboo forest.", ja: "太和江の十里竹林を見ながら楽しむ感性ウィービングクラス。", zh: "边欣赏太和江十里竹林边享受的感性编织课程。" },
    address: { ko: "울산 중구 태화동 33", en: "33 Taehwa-dong, Jung-gu, Ulsan", ja: "蔚山広域市 中区 太和洞 33", zh: "蔚山广域市中区太和洞33" },
    lat: 35.556, lng: 129.320,
    region: "korea", phone: "052-888-9999", website: "https://example.com/ulsan_weave",
    images: ["https://fjwyzhvuskciecqlmcep.supabase.co/storage/v1/object/public/images/workshops/1781496390118_5s1krgm.jpg"],
    languages: ["Korean"],
    snsLinks: { instagram: "https://instagram.com/ulsan_weaving" },
    tags: ["Beginner_Friendly", "city:Ulsan", "district:Jung-gu", "suburb:Taehwa-dong"]
  },
  {
    ownerName: "Sejong Calligraphy",
    name: { ko: "세종 한글 서예 교실", en: "Sejong Hangul Calligraphy", ja: "世宗ハングル書道教室", zh: "世宗韩证书法班" },
    category: "calligraphy",
    description: { ko: "한글의 도시 세종에서 한글 서예의 아름다움을 체험하세요.", en: "Experience the beauty of Hangul calligraphy in Sejong, the city of Hangul.", ja: "ハングルの都市、世宗でハングル書道の美しさを体験してください。", zh: "在韩文之都世宗体验韩文书法的魅力。" },
    address: { ko: "세종특별자치시 나성동 12", en: "12 Naseong-dong, Sejong-si", ja: "世宗特別自治市 羅城洞 12", zh: "世宗特别自治市罗城洞12" },
    lat: 36.480, lng: 127.289,
    region: "korea", phone: "044-123-4567", website: "https://example.com/sejong_calli",
    images: ["https://fjwyzhvuskciecqlmcep.supabase.co/storage/v1/object/public/images/workshops/1781496390118_5s1krgm.jpg"],
    languages: ["Korean", "English"],
    snsLinks: { instagram: "https://instagram.com/sejong_calli" },
    tags: ["English_Spoken", "city:Sejong-si", "suburb:Naseong-dong"]
  },
  {
    ownerName: "Suwon Glass",
    name: { ko: "수원 행궁동 유리공방", en: "Suwon Haenggung-dong Glass", ja: "水原行宮洞ガラス工房", zh: "水原行宫洞玻璃工坊" },
    category: "glass",
    description: { ko: "스테인드글라스로 나만의 소품과 썬캐쳐 만들기.", en: "Make your own props and suncatchers with stained glass.", ja: "ステンドグラスで自分だけの小物やサンキャッチャー作り。", zh: "用彩色玻璃制作属于自己的小物件和捕梦网。" },
    address: { ko: "경기 수원시 팔달구 행궁동 77", en: "77 Haenggung-dong, Paldal-gu, Suwon-si, Gyeonggi-do", ja: "京畿道 水原市 八達区 行宮洞 77", zh: "京畿道水原市八达区行宫洞77" },
    lat: 37.283, lng: 127.014,
    region: "korea", phone: "031-234-5678", website: "https://example.com/suwon_glass",
    images: ["https://fjwyzhvuskciecqlmcep.supabase.co/storage/v1/object/public/images/workshops/1781496390118_5s1krgm.jpg"],
    languages: ["Korean"],
    snsLinks: { instagram: "https://instagram.com/suwon_glass" },
    tags: ["1_Hour_Class", "city:Suwon-si", "district:Paldal-gu", "suburb:Haenggung-dong"]
  },
  {
    ownerName: "Gangneung Coffee",
    name: { ko: "강릉 핸드드립 교실", en: "Gangneung Hand Drip Class", ja: "江陵ハンドドリップ教室", zh: "江陵手冲咖啡课" },
    category: "cooking",
    description: { ko: "커피의 도시 강릉에서 로스팅과 핸드드립 배우기.", en: "Learn roasting and hand drip in Gangneung, the city of coffee.", ja: "コーヒーの都市・江陵で焙煎とハンドドリップを学ぶ。", zh: "在咖啡之都江陵学习烘焙和手冲。" },
    address: { ko: "강원 강릉시 안목해변길 20", en: "20 Anmokhaebyeon-gil, Gangneung-si, Gangwon-do", ja: "江原道 江陵市 安木海辺通り 20", zh: "江原道江陵市安木海滩路20" },
    lat: 37.772, lng: 128.948,
    region: "korea", phone: "033-345-6789", website: "https://example.com/gangneung_coffee",
    images: ["https://fjwyzhvuskciecqlmcep.supabase.co/storage/v1/object/public/images/workshops/1781496390118_5s1krgm.jpg"],
    languages: ["Korean", "English", "Japanese"],
    snsLinks: { instagram: "https://instagram.com/gangneung_coffee" },
    tags: ["Group_Discount", "city:Gangneung-si", "suburb:Anmok"]
  },
  {
    ownerName: "Jeonju Hanbok",
    name: { ko: "전주 한복 공방", en: "Jeonju Hanbok Workshop", ja: "全州韓服工房", zh: "全州韩服工坊" },
    category: "textile",
    description: { ko: "전통 한복 짓기 체험과 미니 저고리 만들기.", en: "Traditional Hanbok making experience and mini Jeogori making.", ja: "伝統韓服作り体験とミニチョゴリ作り。", zh: "传统韩服制作体验和迷你赤古里制作。" },
    address: { ko: "전북 전주시 완산구 한옥마을길 15", en: "15 Hanokmaeul-gil, Wansan-gu, Jeonju, Jeollabuk-do", ja: "全北 全州市 完山区 韓屋村通り 15", zh: "全北全州市完山区韩屋村街15" },
    lat: 35.815, lng: 127.153,
    region: "korea", phone: "063-456-7890", website: "https://example.com/jeonju_hanbok",
    images: ["https://fjwyzhvuskciecqlmcep.supabase.co/storage/v1/object/public/images/workshops/1781496390118_5s1krgm.jpg"],
    languages: ["Korean", "English"],
    snsLinks: { instagram: "https://instagram.com/jeonju_hanbok" },
    tags: ["Tax_Free", "city:Jeonju", "district:Wansan-gu"]
  },
  {
    ownerName: "Andong Mask",
    name: { ko: "안동 하회탈 목공방", en: "Andong Hahoe Mask Woodcraft", ja: "安東河回仮面木工房", zh: "安东河回面具木作" },
    category: "woodworking",
    description: { ko: "세계문화유산 안동에서 전통 하회탈 조각하기.", en: "Carving a traditional Hahoe mask in Andong, a World Heritage site.", ja: "世界文化遺産の安東で伝統的な河回仮面を彫る。", zh: "在世界文化遗产安东雕刻传统的河回面具。" },
    address: { ko: "경북 안동시 하회마을길 44", en: "44 Hahoemaeul-gil, Andong-si, Gyeongsangbuk-do", ja: "慶北 安東市 河回村通り 44", zh: "庆北安东市河回村街44" },
    lat: 36.538, lng: 128.518,
    region: "korea", phone: "054-567-8901", website: "https://example.com/andong_mask",
    images: ["https://fjwyzhvuskciecqlmcep.supabase.co/storage/v1/object/public/images/workshops/1781496390118_5s1krgm.jpg"],
    languages: ["Korean", "Japanese"],
    snsLinks: { instagram: "https://instagram.com/andong_mask" },
    tags: ["city:Andong-si", "suburb:Hahoe Village"]
  },
  {
    ownerName: "Sokcho Pottery",
    name: { ko: "속초 청초호 도예", en: "Sokcho Cheongchoho Pottery", ja: "束草青草湖陶芸", zh: "束草青草湖陶艺" },
    category: "pottery",
    description: { ko: "아름다운 청초호 옆에서 흙을 만지며 힐링하세요.", en: "Heal while touching clay next to the beautiful Cheongchoho Lake.", ja: "美しい青草湖のそばで土を触りながら癒されてください。", zh: "在美丽的青草湖旁触摸泥土治愈自己。" },
    address: { ko: "강원 속초시 청초호반로 100", en: "100 Cheongchohoban-ro, Sokcho-si, Gangwon-do", ja: "江原道 束草市 青草湖畔路 100", zh: "江原道束草市青草湖畔路100" },
    lat: 38.201, lng: 128.588,
    region: "korea", phone: "033-678-9012", website: "https://example.com/sokcho_pottery",
    images: ["https://fjwyzhvuskciecqlmcep.supabase.co/storage/v1/object/public/images/workshops/1781496390118_5s1krgm.jpg"],
    languages: ["Korean"],
    snsLinks: { instagram: "https://instagram.com/sokcho_pottery" },
    tags: ["Beginner_Friendly", "city:Sokcho-si"]
  },
  {
    ownerName: "Gyeongju Jewelry",
    name: { ko: "경주 신라 금관 공방", en: "Gyeongju Silla Crown Craft", ja: "慶州新羅金冠工房", zh: "庆州新罗金冠工坊" },
    category: "jewelry",
    description: { ko: "천년의 수도 경주에서 신라 스타일 금속 공예품 만들기.", en: "Making Silla-style metal crafts in Gyeongju, the millennium capital.", ja: "千年の都、慶州で新羅スタイルの金属工芸品作り。", zh: "在千年古都庆州制作新罗风格的金属工艺品。" },
    address: { ko: "경북 경주시 황남동 30", en: "30 Hwangnam-dong, Gyeongju-si, Gyeongsangbuk-do", ja: "慶北 慶州市 皇南洞 30", zh: "庆北庆州市皇南洞30" },
    lat: 35.839, lng: 129.210,
    region: "korea", phone: "054-789-0123", website: "https://example.com/gyeongju_crown",
    images: ["https://fjwyzhvuskciecqlmcep.supabase.co/storage/v1/object/public/images/workshops/1781496390118_5s1krgm.jpg"],
    languages: ["Korean", "English", "Japanese", "Chinese"],
    snsLinks: { instagram: "https://instagram.com/gyeongju_craft" },
    tags: ["Tax_Free", "city:Gyeongju-si", "suburb:Hwangnam-dong"]
  },
  {
    ownerName: "Chuncheon Soap",
    name: { ko: "춘천 낭만 수제비누", en: "Chuncheon Romantic Soap", ja: "春川ロマンチック石鹸", zh: "春川浪漫香皂" },
    category: "soap",
    description: { ko: "춘천의 맑은 자연을 담은 천연 수제 비누 클래스.", en: "Natural handmade soap class containing the clear nature of Chuncheon.", ja: "春川の澄んだ自然を込めた天然手作り石鹸クラス。", zh: "蕴含春川清澈大自然的天然手工香皂课程。" },
    address: { ko: "강원 춘천시 남산면 강촌리 1", en: "1 Gangchon-ri, Namsan-myeon, Chuncheon-si", ja: "江原道 春川市 南山面 江村里 1", zh: "江原道春川市南山面江村里1" },
    lat: 37.810, lng: 127.632,
    region: "korea", phone: "033-890-1234", website: "https://example.com/chuncheon_soap",
    images: ["https://fjwyzhvuskciecqlmcep.supabase.co/storage/v1/object/public/images/workshops/1781496390118_5s1krgm.jpg"],
    languages: ["Korean"],
    snsLinks: { instagram: "https://instagram.com/chuncheon_soap" },
    tags: ["1_Hour_Class", "city:Chuncheon-si", "suburb:Gangchon"]
  },
  {
    ownerName: "Pohang Leather",
    name: { ko: "포항 영일대 가죽공방", en: "Pohang Yeongildae Leather", ja: "浦項迎日台レザー工房", zh: "浦项迎日台皮革" },
    category: "leather",
    description: { ko: "시원한 포항 앞바다를 바라보며 즐기는 가죽 공예.", en: "Enjoying leather crafts while looking at the cool sea off Pohang.", ja: "涼しい浦項の海を眺めながら楽しむレザークラフト。", zh: "一边欣赏凉爽的浦项海边一边享受皮革工艺。" },
    address: { ko: "경북 포항시 북구 영일대해안길 22", en: "22 Yeongildaehaean-gil, Buk-gu, Pohang-si", ja: "慶北 浦項市 北区 迎日台海岸通り 22", zh: "庆北浦项市北区迎日台海岸路22" },
    lat: 36.061, lng: 129.380,
    region: "korea", phone: "054-901-2345", website: "https://example.com/pohang_leather",
    images: ["https://fjwyzhvuskciecqlmcep.supabase.co/storage/v1/object/public/images/workshops/1781496390118_5s1krgm.jpg"],
    languages: ["Korean"],
    snsLinks: { instagram: "https://instagram.com/pohang_leather" },
    tags: ["city:Pohang-si", "district:Buk-gu"]
  },
  {
    ownerName: "Geoje Candle",
    name: { ko: "거제 몽돌 향초", en: "Geoje Mongdol Candle", ja: "巨済モンドルキャンドル", zh: "巨济鹅卵石蜡烛" },
    category: "candle",
    description: { ko: "거제도 몽돌 해변의 조약돌 모양을 본뜬 젤 캔들.", en: "Gel candle modeled after pebbles on Geoje Island's Mongdol Beach.", ja: "巨済島のモンドルビーチの小石の形を模したジェルキャンドル。", zh: "以巨济岛鹅卵石海滩的鹅卵石形状为模型的果冻蜡烛。" },
    address: { ko: "경남 거제시 동부면 학동리 88", en: "88 Hakdong-ri, Dongbu-myeon, Geoje-si", ja: "慶南 巨済市 東部面 鶴洞里 88", zh: "庆南巨济市东部面鹤洞里88" },
    lat: 34.767, lng: 128.636,
    region: "korea", phone: "055-012-3456", website: "https://example.com/geoje_candle",
    images: ["https://fjwyzhvuskciecqlmcep.supabase.co/storage/v1/object/public/images/workshops/1781496390118_5s1krgm.jpg"],
    languages: ["Korean", "English"],
    snsLinks: { instagram: "https://instagram.com/geoje_candle" },
    tags: ["Beginner_Friendly", "city:Geoje-si", "suburb:Hakdong"]
  },
  {
    ownerName: "Namwon Paper",
    name: { ko: "남원 광한루 한지", en: "Namwon Gwanghallu Hanji", ja: "南原広寒楼韓紙", zh: "南原广寒楼韩纸" },
    category: "paper",
    description: { ko: "춘향의 고장 남원에서 즐기는 고풍스러운 한지 공예.", en: "Enjoying antique Hanji crafts in Namwon, the hometown of Chunhyang.", ja: "春香の故郷・南原で楽しむ古風な韓紙工芸。", zh: "在春香的故乡南原享受古色古香的韩纸工艺。" },
    address: { ko: "전북 남원시 요천로 144", en: "144 Yocheon-ro, Namwon-si, Jeollabuk-do", ja: "全北 南原市 蓼川路 144", zh: "全北南原市蓼川路144" },
    lat: 35.405, lng: 127.382,
    region: "korea", phone: "063-123-9876", website: "https://example.com/namwon_paper",
    images: ["https://fjwyzhvuskciecqlmcep.supabase.co/storage/v1/object/public/images/workshops/1781496390118_5s1krgm.jpg"],
    languages: ["Korean"],
    snsLinks: { instagram: "https://instagram.com/namwon_paper" },
    tags: ["city:Namwon-si"]
  },
  {
    ownerName: "Suwon Baking",
    name: { ko: "수원 왕갈비빵 베이킹", en: "Suwon Rib Bread Baking", ja: "水原王カルビパン作り", zh: "水原王排骨面包烘焙" },
    category: "baking",
    description: { ko: "수원의 명물 갈비를 닮은 특색 있는 빵 굽기 클래스.", en: "Unique bread baking class resembling Suwon's famous ribs.", ja: "水原の名物カルビに似た特色あるパン焼きクラス。", zh: "模仿水原著名排骨的特色面包烘焙课程。" },
    address: { ko: "경기 수원시 장안구 영화동 22", en: "22 Yeonghwa-dong, Jangan-gu, Suwon-si", ja: "京畿道 水原市 長安区 迎華洞 22", zh: "京畿道水原市长安区迎华洞22" },
    lat: 37.291, lng: 127.012,
    region: "korea", phone: "031-234-8765", website: "https://example.com/suwon_rib_bread",
    images: ["https://fjwyzhvuskciecqlmcep.supabase.co/storage/v1/object/public/images/workshops/1781496390118_5s1krgm.jpg"],
    languages: ["Korean", "English"],
    snsLinks: { instagram: "https://instagram.com/suwon_baking" },
    tags: ["Group_Discount", "city:Suwon-si", "district:Jangan-gu"]
  }
];

async function seed() {
  console.log("Fetching a valid user ID...");
  const { data: users, error: userError } = await supabase.from('users').select('id, display_name').limit(1);
  if (userError || !users || users.length === 0) {
    console.error("Failed to fetch a valid user from the 'users' table. Cannot seed without an owner ID.", userError);
    return;
  }
  
  const validUserId = users[0].id;
  const validUserName = users[0].display_name || "Mock Instructor";
  console.log(`Using User ID: ${validUserId}`);

  console.log("Seeding 20 Korea workshops...");
  for (const workshop of MOCK_DATA) {
    const insertData = {
      owner_id: validUserId,
      owner_name: workshop.ownerName,
      name: workshop.name,
      category: workshop.category,
      description: workshop.description,
      address: workshop.address,
      lat: workshop.lat,
      lng: workshop.lng,
      region: workshop.region,
      phone: workshop.phone,
      website: '#',
      images: workshop.images,
      tags: [...workshop.tags, ...workshop.languages.map(l => `lang:${l}`)],
      sns_links: workshop.snsLinks,
      status: 'active'
    };
    
    const { data, error } = await supabase.from('workshops').insert(insertData);
    if (error) {
      console.error(`Failed to insert ${workshop.name.ko}:`, error.message);
    } else {
      console.log(`Successfully inserted: ${workshop.name.ko}`);
    }
  }
  console.log("Done seeding Korea data!");
}

seed().catch(console.error);
