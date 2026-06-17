// ==========================================
// Handmade Workshop Community Map — Types
// ==========================================

export type Locale = 'en' | 'ja' | 'zh' | 'ko';

export type UserRole = 'super_admin' | 'manager' | 'instructor' | 'market_coordinator' | 'member';

export type WorkshopCategory = string;

export type Region = 
  | 'all' | 'korea' | 'japan' | 'taiwan' | 'hongkong' | 'china' 
  | 'singapore' | 'thailand' | 'vietnam' | 'indonesia'
  | 'usa' | 'canada' | 'australia' | 'newzealand'
  | 'uk' | 'france' | 'italy' | 'spain';

export type WorkshopStatus = 'active' | 'inactive' | 'pending';

export type CourseStatus = 'open' | 'closed' | 'cancelled';

export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';

// ==========================================
// User
// ==========================================
export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  createdAt: string;
  preferredLocale: Locale;
  bio?: string;
  disabled?: boolean;
}

// ==========================================
// Workshop
// ==========================================
export interface Workshop {
  id: string;
  ownerId: string;
  ownerName?: string;
  name: Record<Locale, string>;
  category: WorkshopCategory;
  description: Record<Locale, string>;
  address: Record<Locale, string>;
  lat: number;
  lng: number;
  images: string[];
  rating: number;
  reviewCount: number;
  tags: string[];
  languages?: string[];
  phone: string;
  email?: string;
  website?: string;
  snsLinks?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    blog?: string;
  };
  region: Region;
  status: WorkshopStatus;
  createdAt: string;
}

// ==========================================
// Flea Market
// ==========================================
export interface FleaMarket {
  id: string;
  creatorId: string;
  creatorName?: string;
  name: Record<Locale, string>;
  date: string;
  address: Record<Locale, string>;
  lat: number;
  lng: number;
  admissionFee?: string;
  posterUrl?: string;
  images: string[];
  description: Record<Locale, string>;
  phone?: string;
  website?: string;
  instagram?: string;
  youtube?: string;
  vendorApplicationLink?: string;
  applicationClicks?: number;
  source?: 'user' | 'api';
  externalId?: string;
  status?: 'active' | 'inactive';
  createdAt: string;
}

// ==========================================
// Course
// ==========================================
export interface CourseDescription {
  intro: string;
  curriculum: string;
  included: string;
  precautions: string;
}

// ==========================================
export interface Course {
  id: string;
  workshopId: string;
  workshopName?: Record<Locale, string>;
  instructorId: string;
  instructorName?: string;
  title: Record<Locale, string>;
  description: Record<Locale, CourseDescription>;
  price: string;
  duration: string;
  maxParticipants: number;
  currentParticipants: number;
  status: CourseStatus;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  availableDays: number[];
  availableTimes: string[];
  externalLink?: string;
  autoApprove?: boolean;
  createdAt: string;
}

// ==========================================
// Booking
// ==========================================
export interface Booking {
  id: string;
  courseId: string;
  courseTitle?: Record<Locale, string>;
  workshopName?: Record<Locale, string>;
  userId: string;
  userName?: string;
  userPhone?: string;
  status: BookingStatus;
  selectedDate: string;
  selectedTime: string;
  participants: number;
  createdAt: string;
}

// ==========================================
// Review
// ==========================================
export interface Review {
  id: string;
  workshopId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  text: string;
  locale: Locale;
  createdAt: string;
}

// ==========================================
// Inquiry (Contact Us)
// ==========================================
export type InquiryCategory = 'booking' | 'creation' | 'registration' | 'studio' | 'other';
export type InquiryStatus = 'pending' | 'resolved';

export interface Inquiry {
  id: string;
  userId?: string;
  userName?: string;
  userEmail: string;
  title: string;
  category: InquiryCategory;
  content: string;
  status: InquiryStatus;
  reply?: string;
  createdAt: string;
}

// ==========================================
// Notification
// ==========================================
export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

// ==========================================
// Notice (Announcements)
// ==========================================
export interface Notice {
  id: string;
  title: string;
  content: string;
  isMain: boolean;
  isActive: boolean;
  authorName?: string;
  createdAt: string;
}

// ==========================================
// Filter State
// ==========================================
export interface FilterState {
  category: WorkshopCategory | 'all';
  tags: string[];
  region: Region;
}

// ==========================================
// Translation Map
// ==========================================
export type TranslationKey = string;
export type Translations = Record<TranslationKey, string>;

// ==========================================
// Category metadata
// ==========================================
export interface CategoryMeta {
  key: WorkshopCategory;
  emoji: string;
  color: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { key: 'pottery', emoji: '🏺', color: '#c4956a' },
  { key: 'leather', emoji: '🧳', color: '#8B5E3C' },
  { key: 'perfume', emoji: '🌸', color: '#D4A0A7' },
  { key: 'candle', emoji: '🕯️', color: '#E8C07D' },
  { key: 'textile', emoji: '🧶', color: '#7c9a6e' },
  { key: 'jewelry', emoji: '💍', color: '#9B8EC2' },
  { key: 'cooking', emoji: '🍳', color: '#E57373' },
  { key: 'baking', emoji: '🧁', color: '#F06292' },
];

export const SMART_TAGS = [
  'English_Spoken',
  'Tax_Free',
  'Global_Shipping',
  '1_Hour_Class',
  'Beginner_Friendly',
  'Group_Discount',
] as const;

export type SmartTag = (typeof SMART_TAGS)[number];

export const REGIONS: { key: Region; label: Record<Locale, string>; emoji: string; available: boolean; center: [number, number]; zoom: number }[] = [
  // Global
  { key: 'all', label: { en: 'Global', ja: 'グローバル', zh: '全球', ko: '전체' }, emoji: '🌍', available: true, center: [20, 0], zoom: 2 },
  // Asia
  { key: 'korea', label: { en: 'Korea', ja: '韓国', zh: '韩国', ko: '한국' }, emoji: '🇰🇷', available: true, center: [36.3, 127.8], zoom: 7 },
  { key: 'japan', label: { en: 'Japan', ja: '日本', zh: '日本', ko: '일본' }, emoji: '🇯🇵', available: true, center: [36.2, 138.2], zoom: 5 },
  { key: 'taiwan', label: { en: 'Taiwan', ja: '台湾', zh: '台湾', ko: '대만' }, emoji: '🇹🇼', available: true, center: [23.6, 120.9], zoom: 7 },
  { key: 'hongkong', label: { en: 'Hong Kong', ja: '香港', zh: '香港', ko: '홍콩' }, emoji: '🇭🇰', available: true, center: [22.3, 114.1], zoom: 10 },
  { key: 'china', label: { en: 'China', ja: '中国', zh: '中国', ko: '중국' }, emoji: '🇨🇳', available: true, center: [35.8, 104.1], zoom: 4 },
  { key: 'singapore', label: { en: 'Singapore', ja: 'シンガポール', zh: '新加坡', ko: '싱가포르' }, emoji: '🇸🇬', available: true, center: [1.35, 103.8], zoom: 11 },
  { key: 'thailand', label: { en: 'Thailand', ja: 'タイ', zh: '泰国', ko: '태국' }, emoji: '🇹🇭', available: true, center: [15.8, 100.9], zoom: 5 },
  { key: 'vietnam', label: { en: 'Vietnam', ja: 'ベトナム', zh: '越南', ko: '베트남' }, emoji: '🇻🇳', available: true, center: [14.0, 108.2], zoom: 5 },
  { key: 'indonesia', label: { en: 'Indonesia', ja: 'インドネ시아', zh: '印尼', ko: '인도네시아' }, emoji: '🇮🇩', available: true, center: [-0.7, 113.9], zoom: 4 },
  
  // Americas & Oceania
  { key: 'usa', label: { en: 'United States', ja: 'アメリカ', zh: '美国', ko: '미국' }, emoji: '🇺🇸', available: true, center: [37.0, -95.7], zoom: 4 },
  { key: 'canada', label: { en: 'Canada', ja: 'カナダ', zh: '加拿大', ko: '캐나다' }, emoji: '🇨🇦', available: true, center: [56.1, -106.3], zoom: 3 },
  { key: 'australia', label: { en: 'Australia', ja: 'オーストラリア', zh: '澳大利亚', ko: '호주' }, emoji: '🇦🇺', available: true, center: [-25.2, 133.7], zoom: 4 },
  { key: 'newzealand', label: { en: 'New Zealand', ja: 'ニュージーランド', zh: '新西兰', ko: '뉴질랜드' }, emoji: '🇳🇿', available: true, center: [-40.9, 174.8], zoom: 5 },
  
  // Europe
  { key: 'uk', label: { en: 'United Kingdom', ja: 'イギリス', zh: '英国', ko: '영국' }, emoji: '🇬🇧', available: true, center: [55.3, -3.4], zoom: 5 },
  { key: 'france', label: { en: 'France', ja: 'フランス', zh: '法国', ko: '프랑스' }, emoji: '🇫🇷', available: true, center: [46.2, 2.2], zoom: 5 },
  { key: 'italy', label: { en: 'Italy', ja: 'イタリア', zh: '意大利', ko: '이탈리아' }, emoji: '🇮🇹', available: true, center: [41.8, 12.5], zoom: 5 },
  { key: 'spain', label: { en: 'Spain', ja: 'スペイン', zh: '西班牙', ko: '스페인' }, emoji: '🇪🇸', available: true, center: [40.4, -3.7], zoom: 5 },
];
