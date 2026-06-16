import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials. Make sure to run with --env-file=.env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const MOCK_DATA = [
  {
    ownerId: "mock-owner-1",
    ownerName: "Vivalab Studio",
    name: {
      ko: "비바랩 도자기 공방",
      en: "Vivalab Pottery Studio",
      ja: "ビバラブ陶芸工房",
      zh: "Vivalab 陶艺工作室"
    },
    category: "pottery",
    description: {
      ko: "한국의 전통적인 도자기 제작 기법을 배울 수 있는 서울 중심부의 공방입니다.",
      en: "A studio in the heart of Seoul where you can learn traditional Korean pottery techniques.",
      ja: "ソウルの中心部で韓国の伝統的な陶芸技術を学べる工房です。",
      zh: "位于首尔市中心的工作室，您可以在此学习韩国传统的陶艺技术。"
    },
    address: {
      ko: "서울 종로구 북촌로 123",
      en: "123 Bukchon-ro, Jongno-gu, Seoul",
      ja: "ソウル特別市 鍾路区 北村路 123",
      zh: "首尔特别市钟路区北村路123"
    },
    lat: 37.582,
    lng: 126.983,
    region: "korea",
    phone: "010-1234-5678",
    website: "https://example.com",
    images: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80"],
    languages: ["Korean", "English", "Japanese"],
    snsLinks: { instagram: "https://instagram.com/vivalab_pottery" },
    tags: ["Beginner_Friendly", "city:Seoul", "district:Jongno-gu", "suburb:Bukchon"]
  },
  {
    ownerId: "mock-owner-2",
    ownerName: "Seoul Leather Craft",
    name: {
      ko: "서울 가죽 공방",
      en: "Seoul Leather Craft",
      ja: "ソウルレザークラフト",
      zh: "首尔皮革工艺"
    },
    category: "leather",
    description: {
      ko: "나만의 맞춤형 가죽 지갑과 가방을 만드는 원데이 클래스.",
      en: "One-day classes to make your own custom leather wallets and bags.",
      ja: "自分だけのオーダーメイドレザー財布やバッグを作るワンデイクラス。",
      zh: "制作属于自己的定制真皮钱包和包包的一日课程。"
    },
    address: {
      ko: "서울 마포구 홍익로 45",
      en: "45 Hongik-ro, Mapo-gu, Seoul",
      ja: "ソウル特別市 麻浦区 弘益路 45",
      zh: "首尔特别市麻浦区弘益路45"
    },
    lat: 37.555,
    lng: 126.923,
    region: "korea",
    phone: "02-987-6543",
    website: "https://example.com/leather",
    images: ["https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&q=80"],
    languages: ["Korean", "English"],
    snsLinks: { instagram: "https://instagram.com/seoul_leather" },
    tags: ["English_Spoken", "1_Hour_Class", "city:Seoul", "district:Mapo-gu", "suburb:Seogyo-dong"]
  },
  {
    ownerId: "mock-owner-3",
    ownerName: "Scent of Jeju",
    name: {
      ko: "제주의 향기",
      en: "Scent of Jeju",
      ja: "済州の香り",
      zh: "济州之香"
    },
    category: "perfume",
    description: {
      ko: "제주도의 자연에서 영감을 받은 나만의 시그니처 향수 만들기.",
      en: "Create your own signature perfume inspired by the nature of Jeju Island.",
      ja: "済州島の自然からインスピレーションを得た、自分だけのシグネチャー香水作り。",
      zh: "调制属于你自己的标志性香水，灵感来自济州岛的自然风光。"
    },
    address: {
      ko: "제주 제주시 애월로 88",
      en: "88 Aewol-ro, Jeju-si, Jeju-do",
      ja: "済州特別自治道 済州市 涯月路 88",
      zh: "济州特别自治道济州市涯月路88"
    },
    lat: 33.462,
    lng: 126.319,
    region: "korea",
    phone: "064-111-2222",
    website: "https://example.com/jeju",
    images: ["https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80"],
    languages: ["Korean", "Chinese"],
    snsLinks: { instagram: "https://instagram.com/jeju_scent" },
    tags: ["Tax_Free", "city:Jeju-do", "district:Jeju-si", "suburb:Aewol-eup"]
  },
  {
    ownerId: "mock-owner-4",
    ownerName: "Tokyo Candle",
    name: {
      ko: "도쿄 캔들 스튜디오",
      en: "Tokyo Candle Studio",
      ja: "東京キャンドルスタジオ",
      zh: "东京蜡烛工作室"
    },
    category: "candle",
    description: {
      ko: "시부야 한복판에서 즐기는 감성적인 캔들 만들기 체험.",
      en: "An emotional candle-making experience in the heart of Shibuya.",
      ja: "渋谷の真ん中で楽しむ感性的なキャンドル作り体験。",
      zh: "在涩谷市中心享受充满情感的蜡烛制作体验。"
    },
    address: {
      ko: "도쿄도 시부야구 진구마에 1-2-3",
      en: "1-2-3 Jingumae, Shibuya-ku, Tokyo",
      ja: "東京都 渋谷区 神宮前 1-2-3",
      zh: "东京都涩谷区神宫前1-2-3"
    },
    lat: 35.669,
    lng: 139.704,
    region: "japan",
    phone: "+81-3-1234-5678",
    website: "https://example.jp",
    images: ["https://images.unsplash.com/photo-1602874801007-bd458cb6c507?w=800&q=80"],
    languages: ["Japanese", "English"],
    snsLinks: { instagram: "https://instagram.com/tokyocandle" },
    tags: ["Beginner_Friendly", "Group_Discount", "city:Tokyo", "district:Shibuya-ku", "suburb:Jingumae"]
  },
  {
    ownerId: "mock-owner-5",
    ownerName: "Osaka Weaving",
    name: {
      ko: "오사카 직물 공방",
      en: "Osaka Weaving Craft",
      ja: "大阪織物工房",
      zh: "大阪织物工坊"
    },
    category: "textile",
    description: {
      ko: "오사카 전통 직조 방식으로 나만의 텍스타일을 만들어보세요.",
      en: "Create your own textile using traditional Osaka weaving methods.",
      ja: "大阪の伝統的な織り方で、自分だけのテキスタイルを作ってみてください。",
      zh: "使用大阪传统的编织方法制作属于自己的纺织品。"
    },
    address: {
      ko: "오사카시 주오구 난바 1-1",
      en: "1-1 Namba, Chuo-ku, Osaka",
      ja: "大阪府 大阪市 中央区 難波 1-1",
      zh: "大阪府大阪市中央区难波1-1"
    },
    lat: 34.667,
    lng: 135.500,
    region: "japan",
    phone: "+81-6-1111-2222",
    website: "https://example.jp/weaving",
    images: ["https://images.unsplash.com/photo-1596041697334-080c35456fbd?w=800&q=80"],
    languages: ["Japanese", "Korean", "Chinese"],
    snsLinks: { instagram: "https://instagram.com/osaka_weave" },
    tags: ["English_Spoken", "city:Osaka", "district:Chuo-ku", "suburb:Namba"]
  },
  {
    ownerId: "mock-owner-6",
    ownerName: "Taipei Jewelry",
    name: {
      ko: "타이베이 실버 주얼리",
      en: "Taipei Silver Jewelry",
      ja: "台北シルバージュエリー",
      zh: "台北银饰"
    },
    category: "jewelry",
    description: {
      ko: "은을 활용해 나만의 특별한 반지나 목걸이를 제작합니다.",
      en: "Craft your own special ring or necklace using silver.",
      ja: "銀を使って自分だけの特別な指輪やネックレスを作ります。",
      zh: "使用银制作属于您自己的特别戒指或项链。"
    },
    address: {
      ko: "타이베이시 다안구 융캉가 15",
      en: "15 Yongkang St, Da'an District, Taipei City",
      ja: "台北市 大安区 永康街 15",
      zh: "台北市大安区永康街15号"
    },
    lat: 25.032,
    lng: 121.529,
    region: "taiwan",
    phone: "+886-2-8888-9999",
    website: "https://example.tw",
    images: ["https://images.unsplash.com/photo-1599643478524-fb5244197e4b?w=800&q=80"],
    languages: ["Chinese", "English"],
    snsLinks: { instagram: "https://instagram.com/taipei_jewelry" },
    tags: ["1_Hour_Class", "Tax_Free", "city:Taipei City", "district:Da'an District"]
  },
  {
    ownerId: "mock-owner-7",
    ownerName: "Seoul Baking",
    name: {
      ko: "달콤한 서울 베이킹",
      en: "Sweet Seoul Baking",
      ja: "スイートソウルベーキング",
      zh: "甜蜜首尔烘焙"
    },
    category: "baking",
    description: {
      ko: "마카롱과 K-디저트를 직접 만들어보는 달콤한 베이킹 클래스.",
      en: "A sweet baking class where you can make macarons and K-desserts.",
      ja: "マカロンやK-デザートを自分で作る甘いベーキングクラス。",
      zh: "制作马卡龙和韩国甜点的甜蜜烘焙课程。"
    },
    address: {
      ko: "서울 강남구 가로수길 55",
      en: "55 Garosu-gil, Gangnam-gu, Seoul",
      ja: "ソウル特別市 江南区 街路樹通り 55",
      zh: "首尔特别市江南区林荫道55"
    },
    lat: 37.521,
    lng: 127.022,
    region: "korea",
    phone: "02-123-4567",
    website: "https://example.com/baking",
    images: ["https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80"],
    languages: ["Korean", "English", "Japanese"],
    snsLinks: { instagram: "https://instagram.com/seoul_baking" },
    tags: ["Group_Discount", "city:Seoul", "district:Gangnam-gu", "suburb:Sinsa-dong"]
  },
  {
    ownerId: "mock-owner-8",
    ownerName: "Hong Kong Cooking",
    name: {
      ko: "홍콩 딤섬 요리 교실",
      en: "Hong Kong Dim Sum Class",
      ja: "香港点心料理教室",
      zh: "香港点心烹饪课"
    },
    category: "cooking",
    description: {
      ko: "전통 딤섬의 비밀을 현지 셰프와 함께 배워보세요.",
      en: "Learn the secrets of traditional dim sum with a local chef.",
      ja: "地元のシェフと一緒に伝統的な点心の秘密を学びましょう。",
      zh: "与当地厨师一起学习传统点心的秘密。"
    },
    address: {
      ko: "홍콩 센트럴 웰링턴 스트리트 8",
      en: "8 Wellington St, Central, Hong Kong",
      ja: "香港 セントラル ウェリントンストリート 8",
      zh: "香港中环威灵顿街8号"
    },
    lat: 22.282,
    lng: 114.155,
    region: "hongkong",
    phone: "+852-2222-3333",
    website: "https://example.hk",
    images: ["https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80"],
    languages: ["Chinese", "English"],
    snsLinks: { instagram: "https://instagram.com/hk_dimsum" },
    tags: ["Beginner_Friendly", "city:Hong Kong", "district:Central"]
  },
  {
    ownerId: "mock-owner-9",
    ownerName: "Kyoto Woodworking",
    name: {
      ko: "교토 전통 목공예",
      en: "Kyoto Traditional Woodcraft",
      ja: "京都伝統木工芸",
      zh: "京都传统木作"
    },
    category: "woodworking",
    description: {
      ko: "향기로운 나무를 다듬어 나만의 젓가락과 소품을 만드는 체험.",
      en: "An experience of carving fragrant wood to make your own chopsticks and props.",
      ja: "香りの良い木を削って、自分だけの箸や小物を作る体験。",
      zh: "体验雕刻芳香的木头，制作属于您自己的筷子和小物件。"
    },
    address: {
      ko: "교토시 히가시야마구 기요미즈 1-294",
      en: "1-294 Kiyomizu, Higashiyama Ward, Kyoto",
      ja: "京都府 京都市 東山区 清水 1-294",
      zh: "京都府京都市东山区清水1-294"
    },
    lat: 34.994,
    lng: 135.785,
    region: "japan",
    phone: "+81-75-123-4567",
    website: "https://example.jp/wood",
    images: ["https://images.unsplash.com/photo-1582200216259-3a6d9de42b26?w=800&q=80"],
    languages: ["Japanese", "English", "Chinese"],
    snsLinks: { instagram: "https://instagram.com/kyoto_wood" },
    tags: ["Global_Shipping", "city:Kyoto", "district:Higashiyama Ward"]
  },
  {
    ownerId: "mock-owner-10",
    ownerName: "Busan Glass",
    name: {
      ko: "부산 바다 유리공방",
      en: "Busan Ocean Glass",
      ja: "釜山海ガラス工房",
      zh: "釜山海洋玻璃工坊"
    },
    category: "glass",
    description: {
      ko: "부산 앞바다의 색을 담은 유리 공예품을 만들어보세요.",
      en: "Create glass crafts filled with the colors of the sea off Busan.",
      ja: "釜山の海の色を閉じ込めたガラス工芸品を作ってみてください。",
      zh: "制作充满釜山海色的玻璃工艺品。"
    },
    address: {
      ko: "부산광역시 해운대구 달맞이길 11",
      en: "11 Dalmaji-gil, Haeundae-gu, Busan",
      ja: "釜山広域市 海雲台区 タルマジキル 11",
      zh: "釜山广域市海云台区迎月路11"
    },
    lat: 35.159,
    lng: 129.172,
    region: "korea",
    phone: "051-777-8888",
    website: "https://example.com/glass",
    images: ["https://images.unsplash.com/photo-1583091173872-cb1e6a9787ff?w=800&q=80"],
    languages: ["Korean", "English", "Japanese"],
    snsLinks: { instagram: "https://instagram.com/busan_glass" },
    tags: ["Beginner_Friendly", "city:Busan", "district:Haeundae-gu", "suburb:Jung-dong"]
  },
  {
    ownerId: "mock-owner-11",
    ownerName: "Hanji Craft",
    name: {
      ko: "전주 한지 공예",
      en: "Jeonju Hanji Craft",
      ja: "全州韓紙工芸",
      zh: "全州韩纸工艺"
    },
    category: "paper",
    description: {
      ko: "전통 한지를 이용해 아름다운 조명과 부채를 만듭니다.",
      en: "Make beautiful lamps and fans using traditional Hanji paper.",
      ja: "伝統的な韓紙を使って美しい照明や扇子を作ります。",
      zh: "使用传统韩纸制作美丽的灯具和扇子。"
    },
    address: {
      ko: "전북특별자치도 전주시 완산구 은행로 22",
      en: "22 Eunhaeng-ro, Wansan-gu, Jeonju",
      ja: "全北特別自治道 全州市 完山区 銀行路 22",
      zh: "全北特别自治道全州市完山区银杏路22"
    },
    lat: 35.814,
    lng: 127.151,
    region: "korea",
    phone: "063-222-3333",
    website: "https://example.com/hanji",
    images: ["https://images.unsplash.com/photo-1589146182103-b09e1e2d4d98?w=800&q=80"],
    languages: ["Korean", "English"],
    snsLinks: { instagram: "https://instagram.com/jeonju_hanji" },
    tags: ["1_Hour_Class", "city:Jeonju", "district:Wansan-gu"]
  },
  {
    ownerId: "mock-owner-12",
    ownerName: "NY Pottery",
    name: {
      ko: "뉴욕 센트럴 도예",
      en: "New York Central Pottery",
      ja: "ニューヨークセントラル陶芸",
      zh: "纽约中央陶艺"
    },
    category: "pottery",
    description: {
      ko: "맨해튼에서 배우는 모던 도자기 클래스.",
      en: "Modern pottery classes learned in Manhattan.",
      ja: "マンハッタンで学ぶモダンな陶芸クラス。",
      zh: "在曼哈顿学习的现代陶艺课程。"
    },
    address: {
      ko: "미국 뉴욕 맨해튼 브로드웨이 100",
      en: "100 Broadway, Manhattan, New York, NY",
      ja: "アメリカ合衆国 ニューヨーク マンハッタン ブロードウェイ 100",
      zh: "美国纽约曼哈顿百老汇100"
    },
    lat: 40.712,
    lng: -74.006,
    region: "usa",
    phone: "+1-212-555-0199",
    website: "https://example.com/ny",
    images: ["https://images.unsplash.com/photo-1565194488347-f77eecafcd6c?w=800&q=80"],
    languages: ["English"],
    snsLinks: { instagram: "https://instagram.com/ny_pottery" },
    tags: ["Beginner_Friendly", "English_Spoken", "city:New York", "district:Manhattan"]
  },
  {
    ownerId: "mock-owner-13",
    ownerName: "Singapore Leather",
    name: {
      ko: "싱가포르 마리나 가죽공방",
      en: "Singapore Marina Leather Craft",
      ja: "シンガポールマリーナレザークラフト",
      zh: "新加坡滨海皮革工艺"
    },
    category: "leather",
    description: {
      ko: "마리나 베이 샌즈 근처의 프리미엄 가죽 공방.",
      en: "A premium leather workshop near Marina Bay Sands.",
      ja: "マリーナベイサンズ近くのプレミアムレザー工房。",
      zh: "滨海湾金沙附近的顶级皮革作坊。"
    },
    address: {
      ko: "싱가포르 오차드 로드 22",
      en: "22 Orchard Rd, Singapore",
      ja: "シンガポール オーチャードロード 22",
      zh: "新加坡乌节路22号"
    },
    lat: 1.303,
    lng: 103.832,
    region: "singapore",
    phone: "+65-6789-0123",
    website: "https://example.sg",
    images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80"],
    languages: ["English", "Chinese"],
    snsLinks: { instagram: "https://instagram.com/sg_leather" },
    tags: ["Group_Discount", "city:Singapore", "suburb:Orchard"]
  },
  {
    ownerId: "mock-owner-14",
    ownerName: "London Perfume",
    name: {
      ko: "런던 로얄 향수공방",
      en: "London Royal Perfume",
      ja: "ロンドンロイヤル香水工房",
      zh: "伦敦皇家香水工坊"
    },
    category: "perfume",
    description: {
      ko: "영국의 우아함을 담은 맞춤형 향수 제작.",
      en: "Custom perfume creation containing the elegance of England.",
      ja: "イギリスの優雅さを込めたオーダーメイド香水制作。",
      zh: "定制香水，蕴含英伦优雅。"
    },
    address: {
      ko: "영국 런던 옥스포드 스트리트 400",
      en: "400 Oxford St, London, UK",
      ja: "イギリス ロンドン オックスフォードストリート 400",
      zh: "英国伦敦牛津街400"
    },
    lat: 51.514,
    lng: -0.153,
    region: "uk",
    phone: "+44-20-7123-4567",
    website: "https://example.co.uk",
    images: ["https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80"],
    languages: ["English"],
    snsLinks: { instagram: "https://instagram.com/london_perfume" },
    tags: ["Tax_Free", "city:London", "suburb:West End"]
  },
  {
    ownerId: "mock-owner-15",
    ownerName: "Paris Baking",
    name: {
      ko: "파리 크루아상 베이킹 교실",
      en: "Paris Croissant Baking Class",
      ja: "パリクロワッサンベーキング教室",
      zh: "巴黎羊角面包烘焙课"
    },
    category: "baking",
    description: {
      ko: "정통 프랑스 크루아상과 바게트 굽기.",
      en: "Baking authentic French croissants and baguettes.",
      ja: "本格的なフランスのクロワッサンとバゲットを焼く。",
      zh: "烘焙正宗的法国羊角面包和法式长棍面包。"
    },
    address: {
      ko: "프랑스 파리 샹젤리제 거리 50",
      en: "50 Av. des Champs-Élysées, Paris, France",
      ja: "フランス パリ シャンゼリゼ通り 50",
      zh: "法国巴黎香榭丽舍大街50"
    },
    lat: 48.870,
    lng: 2.307,
    region: "france",
    phone: "+33-1-23-45-67-89",
    website: "https://example.fr",
    images: ["https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=800&q=80"],
    languages: ["French", "English"],
    snsLinks: { instagram: "https://instagram.com/paris_baking" },
    tags: ["English_Spoken", "city:Paris", "suburb:8th Arrondissement"]
  },
  {
    ownerId: "mock-owner-16",
    ownerName: "Jeonju Cooking",
    name: {
      ko: "전주 비빔밥 요리교실",
      en: "Jeonju Bibimbap Cooking Class",
      ja: "全州ビビンバ料理教室",
      zh: "全州拌饭烹饪课"
    },
    category: "cooking",
    description: {
      ko: "가장 한국적인 맛, 전통 전주 비빔밥을 직접 만들어보세요.",
      en: "Experience making traditional Jeonju Bibimbap, the most Korean taste.",
      ja: "最も韓国的な味、伝統的な全州ビビンバを自分で作ってみてください。",
      zh: "体验制作传统全州拌饭，最正宗的韩国味道。"
    },
    address: {
      ko: "전북 전주시 완산구 한지길 10",
      en: "10 Hanji-gil, Wansan-gu, Jeonju, Jeollabuk-do",
      ja: "全北 全州市 完山区 韓紙路 10",
      zh: "全北全州市完山区韩纸街10"
    },
    lat: 35.815,
    lng: 127.152,
    region: "korea",
    phone: "063-444-5555",
    website: "https://example.com/jeonju_cook",
    images: ["https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=800&q=80"],
    languages: ["Korean", "English", "Japanese"],
    snsLinks: { instagram: "https://instagram.com/jeonju_bibimbap" },
    tags: ["city:Jeonju", "district:Wansan-gu", "suburb:Hanok Village"]
  },
  {
    ownerId: "mock-owner-17",
    ownerName: "Toronto Textile",
    name: {
      ko: "토론토 퀼트 공방",
      en: "Toronto Quilt Workshop",
      ja: "トロントキルト工房",
      zh: "多伦多绗缝作坊"
    },
    category: "textile",
    description: {
      ko: "따뜻한 감성의 퀼트 담요를 만드는 클래스.",
      en: "A class to make quilt blankets with warm emotions.",
      ja: "温かい感性のキルトブランケットを作るクラス。",
      zh: "制作充满温暖情感的绗缝毯子的课程。"
    },
    address: {
      ko: "캐나다 토론토 퀸 스트리트 120",
      en: "120 Queen St W, Toronto, ON, Canada",
      ja: "カナダ トロント クイーンストリート 120",
      zh: "加拿大多伦多皇后西街120"
    },
    lat: 43.651,
    lng: -79.383,
    region: "canada",
    phone: "+1-416-555-0100",
    website: "https://example.ca",
    images: ["https://images.unsplash.com/photo-1522880922851-4033320f78d9?w=800&q=80"],
    languages: ["English", "French"],
    snsLinks: { instagram: "https://instagram.com/toronto_quilt" },
    tags: ["Beginner_Friendly", "city:Toronto", "suburb:Downtown"]
  },
  {
    ownerId: "mock-owner-18",
    ownerName: "Seoul Calligraphy",
    name: {
      ko: "서울 캘리그라피",
      en: "Seoul Calligraphy",
      ja: "ソウルカリグラフィー",
      zh: "首尔书法"
    },
    category: "calligraphy",
    description: {
      ko: "전통 붓과 먹을 이용한 아름다운 한글 캘리그라피.",
      en: "Beautiful Hangul calligraphy using traditional brushes and ink.",
      ja: "伝統的な筆と墨を使った美しいハングルカリグラフィー。",
      zh: "使用传统毛笔和墨水的美丽韩文书法。"
    },
    address: {
      ko: "서울 종로구 인사동길 33",
      en: "33 Insadong-gil, Jongno-gu, Seoul",
      ja: "ソウル特別市 鍾路区 仁寺洞通り 33",
      zh: "首尔特别市钟路区仁寺洞街33"
    },
    lat: 37.574,
    lng: 126.985,
    region: "korea",
    phone: "02-222-3333",
    website: "https://example.com/calli",
    images: ["https://images.unsplash.com/photo-1563821016839-446735edc6fa?w=800&q=80"],
    languages: ["Korean", "English"],
    snsLinks: { instagram: "https://instagram.com/seoul_calli" },
    tags: ["1_Hour_Class", "city:Seoul", "district:Jongno-gu", "suburb:Insa-dong"]
  },
  {
    ownerId: "mock-owner-19",
    ownerName: "Chiang Mai Silver",
    name: {
      ko: "치앙마이 은공예",
      en: "Chiang Mai Silver Craft",
      ja: "チェンマイ銀工芸",
      zh: "清迈银饰工艺"
    },
    category: "jewelry",
    description: {
      ko: "태국 치앙마이의 전통 은세공 기법 배우기.",
      en: "Learn traditional silvercraft techniques in Chiang Mai, Thailand.",
      ja: "タイ・チェンマイの伝統的な銀細工技術を学ぶ。",
      zh: "在泰国清迈学习传统银饰工艺技术。"
    },
    address: {
      ko: "태국 치앙마이 님만해민 15",
      en: "15 Nimmanahaeminda Rd, Chiang Mai, Thailand",
      ja: "タイ チェンマイ ニンマンヘミン 15",
      zh: "泰国清迈尼曼路15号"
    },
    lat: 18.796,
    lng: 98.966,
    region: "thailand",
    phone: "+66-53-111-222",
    website: "https://example.th",
    images: ["https://images.unsplash.com/photo-1596700010915-1845bb02029c?w=800&q=80"],
    languages: ["Thai", "English"],
    snsLinks: { instagram: "https://instagram.com/chiangmai_silver" },
    tags: ["Global_Shipping", "city:Chiang Mai", "suburb:Nimman"]
  },
  {
    ownerId: "mock-owner-20",
    ownerName: "Seoul Soap",
    name: {
      ko: "서울 수제 비누 공방",
      en: "Seoul Handmade Soap",
      ja: "ソウル手作り石鹸工房",
      zh: "首尔手工皂工坊"
    },
    category: "soap",
    description: {
      ko: "천연 재료를 사용한 나만의 예쁜 비누 만들기.",
      en: "Make your own pretty soap using natural ingredients.",
      ja: "天然素材を使った自分だけの可愛い石鹸作り。",
      zh: "使用天然原料制作属于你自己的漂亮香皂。"
    },
    address: {
      ko: "서울 마포구 연남동 239",
      en: "239 Yeonnam-dong, Mapo-gu, Seoul",
      ja: "ソウル特別市 麻浦区 延南洞 239",
      zh: "首尔特别市麻浦区延南洞239"
    },
    lat: 37.562,
    lng: 126.924,
    region: "korea",
    phone: "02-555-6666",
    website: "https://example.com/soap",
    images: ["https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=800&q=80"],
    languages: ["Korean", "English", "Japanese"],
    snsLinks: { instagram: "https://instagram.com/seoul_soap" },
    tags: ["1_Hour_Class", "Beginner_Friendly", "city:Seoul", "district:Mapo-gu", "suburb:Yeonnam-dong"]
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

  console.log("Seeding 20 mock workshops...");
  for (const workshop of MOCK_DATA) {
    const insertData = {
      owner_id: validUserId,
      owner_name: validUserName,
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
  console.log("Done seeding!");
}

seed().catch(console.error);
