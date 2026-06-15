// ==========================================
// Handmade Workshop Community Map — Types
// ==========================================

export type Locale = 'en' | 'ja' | 'zh' | 'ko';

export type UserRole = 'super_admin' | 'manager' | 'instructor' | 'market_coordinator' | 'member';

export type WorkshopCategory =
  | 'pottery'
  | 'leather'
  | 'perfume'
  | 'candle'
  | 'textile'
  | 'jewelry';

export type Region = 'korea' | 'southeast_asia' | 'north_america' | 'northern_europe';

export type WorkshopStatus = 'active' | 'inactive' | 'pending';

export type CourseStatus = 'open' | 'closed' | 'cancelled';

export type BookingStatus = 'confirmed' | 'cancelled';

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
  phone: string;
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
export interface Course {
  id: string;
  workshopId: string;
  workshopName?: Record<Locale, string>;
  instructorId: string;
  instructorName?: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
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
export type InquiryCategory = 'booking' | 'creation' | 'registration' | 'other';
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
  { key: 'korea', label: { en: 'Korea', ja: '韓国', zh: '韩国', ko: '한국' }, emoji: '🇰🇷', available: true, center: [36.3, 127.8], zoom: 7 },
  { key: 'southeast_asia', label: { en: 'Southeast Asia', ja: '東南アジア', zh: '东南亚', ko: '동남아시아' }, emoji: '🌏', available: false, center: [13.7563, 100.5018], zoom: 12 },
  { key: 'north_america', label: { en: 'North America', ja: '北米', zh: '北美', ko: '북미' }, emoji: '🌎', available: false, center: [40.7128, -74.006], zoom: 12 },
  { key: 'northern_europe', label: { en: 'Northern Europe', ja: '北欧', zh: '北欧', ko: '북유럽' }, emoji: '🇸🇪', available: false, center: [59.3293, 18.0686], zoom: 12 },
];
