// ==========================================
// Supabase CRUD Operations
// ==========================================
import { supabase, isSupabaseConfigured } from './supabase';
import type {
  Workshop,
  Course,
  Booking,
  Review,
  UserRole,
  Inquiry,
  AppUser,
  FleaMarket,
  AppNotification,
  Notice,
  Locale,
} from '@/types';
import { demoWorkshops, demoReviews, demoCourses, demoBookings, demoInquiries, demoNotices } from '@/data/workshops';

const safeParse = (val: any) => {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
};

const ensureLocaleObject = (val: any): Record<Locale, string> => {
  const parsed = safeParse(val);
  if (typeof parsed === 'string') {
    return { ko: parsed, en: '', ja: '', zh: '' };
  }
  return parsed || { ko: '', en: '', ja: '', zh: '' };
};

const mapWorkshop = (d: any): Workshop => {
  const nameObj = safeParse(d.name) || {en:'',ko:'',ja:'',zh:''};
  const fallbackSlug = (nameObj.en || nameObj.ko || d.id || 'workshop').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return {
  id: d.id, slug: d.slug || fallbackSlug, ownerId: d.owner_id, ownerName: d.owner_name, name: nameObj, category: d.category,
  description: safeParse(d.description) || {en:'',ko:'',ja:'',zh:''}, address: safeParse(d.address) || {en:'',ko:'',ja:'',zh:''}, lat: d.lat, lng: d.lng,
  images: safeParse(d.images) || [], rating: d.rating, reviewCount: d.review_count,
  tags: safeParse(d.tags)?.filter((t:string) => !t.startsWith('lang:')) || [], 

  languages: safeParse(d.tags)?.filter((t:string) => t.startsWith('lang:')).map((t:string) => t.replace('lang:', '')) || safeParse(d.languages) || [], 
  phone: d.phone, email: d.email, website: d.website, snsLinks: safeParse(d.sns_links),
  region: d.region, status: d.status, isPrivate: d.is_private || false,
  totalClicks: d.total_clicks || 0,
  websiteClicks: d.website_clicks || 0,
  instagramClicks: d.instagram_clicks || 0,
  youtubeClicks: d.youtube_clicks || 0,
  shareClicks: d.share_clicks || 0,
  navClicks: d.nav_clicks || 0,
  mapPinClicks: d.map_pin_clicks || 0,
  listClicks: d.list_clicks || 0,
  createdAt: d.created_at,
  };
};
const mapCourse = (d: any): Course => ({
  id: d.id, workshopId: d.workshop_id, instructorId: d.instructor_id, instructorName: d.instructor_name,
  title: d.title, description: d.description, price: d.price, duration: d.duration,
  maxParticipants: d.max_participants, currentParticipants: d.current_participants,
  status: d.status, isPrivate: d.is_private || false, imageUrl: d.image_url, startDate: d.start_date, endDate: d.end_date,
  availableDays: d.available_days || [], availableTimes: d.available_times || [],
  externalLink: d.external_link,
  autoApprove: d.auto_approve ?? false,
  createdAt: d.created_at,
});
const mapBooking = (d: any): Booking => ({
  id: d.id, courseId: d.course_id, userId: d.user_id, userName: d.user_name, userPhone: d.user_phone,
  status: d.status, selectedDate: d.selected_date, selectedTime: d.selected_time, participants: d.participants || 1, createdAt: d.created_at,
});
const mapReview = (d: any): Review => ({
  id: d.id, workshopId: d.workshop_id, userId: d.user_id, userName: d.user_name,
  userPhoto: d.user_photo, rating: d.rating, text: d.text, locale: d.locale, createdAt: d.created_at,
});
const mapUser = (d: any): AppUser => ({
  id: d.id, email: d.email, displayName: d.display_name, photoURL: d.photo_url,
  role: d.role, createdAt: d.created_at, preferredLocale: d.preferred_locale,
  bio: d.bio, disabled: d.disabled,
});
const mapInquiry = (d: any): Inquiry => ({
  id: d.id, userId: d.user_id, userName: d.user_name, userEmail: d.user_email,
  title: d.title, category: d.category, content: d.content, status: d.status,
  reply: d.reply, createdAt: d.created_at,
});
const mapFleaMarket = (d: any): FleaMarket => ({
  id: d.id, creatorId: d.creator_id, creatorName: d.creator_name, 
  name: ensureLocaleObject(d.name),
  date: d.date, 
  address: ensureLocaleObject(d.address), 
  lat: d.lat, lng: d.lng, admissionFee: d.admission_fee,
  posterUrl: d.poster_url, images: safeParse(d.images) || [], 
  description: ensureLocaleObject(d.description),
  phone: d.phone, website: d.website, instagram: d.instagram, youtube: d.youtube,
  vendorApplicationLink: d.vendor_application_link,
  applicationClicks: d.application_clicks || 0,
  source: d.source || 'user',
  externalId: d.external_id,
  status: d.status || 'active',
  createdAt: d.created_at,
});

const mapNotification = (d: any): AppNotification => ({
  id: d.id, userId: d.user_id, title: d.title, message: d.message,
  linkUrl: d.link_url, isRead: d.is_read, createdAt: d.created_at,
});

// ==========================================
// Workshops
// ==========================================

function getLocalWorkshops(): Workshop[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('demoWorkshops');
    if (saved) return JSON.parse(saved);
  }
  return [...demoWorkshops];
}

function saveLocalWorkshops(workshops: Workshop[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('demoWorkshops', JSON.stringify(workshops));
  }
}

export async function getWorkshops(): Promise<Workshop[]> {
  if (!supabase || !isSupabaseConfigured) return getLocalWorkshops();
  const { data, error } = await supabase.from('workshops').select('*').order('created_at', { ascending: false });
  if (error || !data) return getLocalWorkshops();
  return (data || []).map(mapWorkshop);
}

export async function getWorkshopsByOwner(ownerId: string): Promise<Workshop[]> {
  if (!supabase || !isSupabaseConfigured) return getLocalWorkshops().filter(w => w.ownerId === ownerId);
  const { data, error } = await supabase.from('workshops').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false });
  if (error || !data) return getLocalWorkshops().filter(w => w.ownerId === ownerId);
  return (data || []).map(mapWorkshop);
}

export async function getWorkshopById(id: string): Promise<Workshop | null> {
  if (!supabase || !isSupabaseConfigured) return getLocalWorkshops().find(w => w.id === id) || null;
  const { data, error } = await supabase.from('workshops').select('*').eq('id', id).single();
  if (error || !data) return getLocalWorkshops().find(w => w.id === id) || null;
  return data ? mapWorkshop(data) : null;
}

export async function getWorkshopBySlug(slug: string): Promise<Workshop | null> {
  if (!supabase || !isSupabaseConfigured) return getLocalWorkshops().find(w => w.slug === slug) || null;
  
  const { data, error } = await supabase.from('workshops').select('*').eq('slug', slug).single();
  
  if (data) return mapWorkshop(data);
  
  // FALLBACK: If slug column doesn't exist (error 42703) or query fails, fetch all and match
  const { data: allData } = await supabase.from('workshops').select('*');
  if (allData) {
    const matched = allData.find(d => {
      const w = mapWorkshop(d);
      return w.slug.toLowerCase() === slug.toLowerCase() || w.id === slug;
    });
    if (matched) return mapWorkshop(matched);
  }
  
  return getLocalWorkshops().find(w => w.slug.toLowerCase() === slug.toLowerCase()) || null;
}

export async function createWorkshop(data: Omit<Workshop, 'id' | 'createdAt' | 'rating' | 'reviewCount'>): Promise<string> {
  if (!supabase || !isSupabaseConfigured) {
    const newWorkshop = { ...data, id: `w_${Date.now()}`, createdAt: new Date().toISOString(), rating: 0, reviewCount: 0 };
    const local = getLocalWorkshops();
    local.unshift(newWorkshop as Workshop);
    saveLocalWorkshops(local);
    return newWorkshop.id;
  }
  const insertData = {
    owner_id: data.ownerId, owner_name: data.ownerName, name: data.name, category: data.category,
    description: data.description, address: data.address, lat: data.lat, lng: data.lng,
    images: data.images, tags: [...(data.tags || []), ...(data.languages?.map(l => `lang:${l}`) || [])], phone: data.phone, email: data.email, website: data.website,
    sns_links: data.snsLinks, region: data.region, status: data.status, is_private: data.isPrivate || false,
  };
  const { data: res, error } = await supabase.from('workshops').insert(insertData).select('id').single();
  if (error) {
    console.warn("Supabase insert failed, falling back to local memory:", error);
    const newWorkshop = { ...data, id: `w_${Date.now()}`, createdAt: new Date().toISOString(), rating: 0, reviewCount: 0 };
    const local = getLocalWorkshops();
    local.unshift(newWorkshop as Workshop);
    saveLocalWorkshops(local);
    return newWorkshop.id;
  }
  return res.id;
}

export async function updateWorkshop(id: string, data: Partial<Workshop>): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    const local = getLocalWorkshops();
    const idx = local.findIndex(w => w.id === id);
    if (idx > -1) {
      local[idx] = { ...local[idx], ...data };
      saveLocalWorkshops(local);
    }
    return;
  }
  const updateData: any = {};
  if (data.ownerId) {
    updateData.owner_id = data.ownerId;
    if (data.ownerName) updateData.owner_name = data.ownerName;
  }
  if (data.name) updateData.name = data.name;
  if (data.description) updateData.description = data.description;
  if (data.address) updateData.address = data.address;
  if (data.category) updateData.category = data.category;
  if (data.status) updateData.status = data.status;
  if (data.images) updateData.images = data.images;
  if (data.tags || data.languages) {
    const existingTags = data.tags || [];
    const newLangs = data.languages?.map(l => `lang:${l}`) || [];
    updateData.tags = [...existingTags, ...newLangs];
  }
  if (data.phone) updateData.phone = data.phone;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.website !== undefined) updateData.website = data.website;
  if (data.snsLinks !== undefined) updateData.sns_links = data.snsLinks;
  if (data.region) updateData.region = data.region;
  if (data.lat !== undefined) updateData.lat = data.lat;
  if (data.lng !== undefined) updateData.lng = data.lng;
  if (data.isPrivate !== undefined) updateData.is_private = data.isPrivate;
  
  const { error } = await supabase.from('workshops').update(updateData).eq('id', id);
  if (error) {
    console.warn("Supabase update failed, falling back to local memory:", error);
    const local = getLocalWorkshops();
    const idx = local.findIndex(w => w.id === id);
    if (idx > -1) {
      local[idx] = { ...local[idx], ...data };
      saveLocalWorkshops(local);
    }
  }
}

export async function deleteWorkshop(id: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    const local = getLocalWorkshops();
    const idx = local.findIndex(w => w.id === id);
    if (idx > -1) {
      local.splice(idx, 1);
      saveLocalWorkshops(local);
    }
    return;
  }
  const { error } = await supabase.from('workshops').delete().eq('id', id);
  if (error) {
    console.warn("Supabase delete failed, falling back to local memory:", error);
    const local = getLocalWorkshops();
    const idx = local.findIndex(w => w.id === id);
    if (idx > -1) {
      local.splice(idx, 1);
      saveLocalWorkshops(local);
    }
  }
}

export async function incrementWorkshopLinkClick(workshopId: string, linkType: string): Promise<void> {
  if (!supabase) {
    const local = getLocalWorkshops();
    const idx = local.findIndex(w => w.id === workshopId);
    if (idx > -1) {
      if (linkType !== 'map_pin' && linkType !== 'list_item') {
        local[idx].totalClicks = (local[idx].totalClicks || 0) + 1;
      }
      if (linkType === 'website') local[idx].websiteClicks = (local[idx].websiteClicks || 0) + 1;
      else if (linkType === 'instagram') local[idx].instagramClicks = (local[idx].instagramClicks || 0) + 1;
      else if (linkType === 'youtube') local[idx].youtubeClicks = (local[idx].youtubeClicks || 0) + 1;
      else if (linkType === 'share') local[idx].shareClicks = (local[idx].shareClicks || 0) + 1;
      else if (linkType === 'nav') local[idx].navClicks = (local[idx].navClicks || 0) + 1;
      else if (linkType === 'map_pin') local[idx].mapPinClicks = (local[idx].mapPinClicks || 0) + 1;
      else if (linkType === 'list_item') local[idx].listClicks = (local[idx].listClicks || 0) + 1;
      saveLocalWorkshops(local);
    }
    return;
  }
  await supabase.rpc('increment_workshop_click', { p_workshop_id: workshopId, p_link_type: linkType });
}

// ==========================================
// Courses
// ==========================================
export async function getCourses(): Promise<Course[]> {
  if (!supabase || !isSupabaseConfigured) return demoCourses;
  const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
  return (data || []).map(mapCourse);
}

export async function getCoursesByWorkshop(workshopId: string): Promise<Course[]> {
  if (!supabase || !isSupabaseConfigured) return demoCourses.filter(c => c.workshopId === workshopId);
  const { data } = await supabase.from('courses').select('*').eq('workshop_id', workshopId).order('created_at', { ascending: false });
  return (data || []).map(mapCourse);
}

export async function getCoursesByInstructor(instructorId: string): Promise<Course[]> {
  if (!supabase || !isSupabaseConfigured) return demoCourses.filter(c => c.instructorId === instructorId);
  const { data } = await supabase.from('courses')
    .select('*, workshops(name)')
    .eq('instructor_id', instructorId)
    .order('created_at', { ascending: false });
  return (data || []).map(d => {
    const c = mapCourse(d);
    if (d.workshops) {
      c.workshopName = d.workshops.name;
    }
    return c;
  });
}

export async function createCourse(data: Omit<Course, 'id' | 'createdAt' | 'currentParticipants'>): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured');
  const insertData = {
    workshop_id: data.workshopId, instructor_id: data.instructorId, instructor_name: data.instructorName,
    title: data.title, description: data.description, price: data.price, duration: data.duration,
    max_participants: data.maxParticipants, status: data.status, is_private: data.isPrivate || false, image_url: data.imageUrl,
    start_date: data.startDate, end_date: data.endDate, 
    available_days: data.availableDays, available_times: data.availableTimes,
    external_link: data.externalLink,
    auto_approve: data.autoApprove ?? false,
  };
  const { data: res, error } = await supabase.from('courses').insert(insertData).select('id').single();
  if (error) throw error;
  return res.id;
}

export async function updateCourse(id: string, data: Partial<Course>): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const updateData: any = {};
  if (data.title) updateData.title = data.title;
  if (data.description) updateData.description = data.description;
  if (data.price) updateData.price = data.price;
  if (data.status) updateData.status = data.status;
  if (data.isPrivate !== undefined) updateData.is_private = data.isPrivate;
  if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;
  if (data.startDate) updateData.start_date = data.startDate;
  if (data.endDate) updateData.end_date = data.endDate;
  if (data.availableDays) updateData.available_days = data.availableDays;
  if (data.availableTimes) updateData.available_times = data.availableTimes;
  if (data.externalLink !== undefined) updateData.external_link = data.externalLink;
  if (data.autoApprove !== undefined) updateData.auto_approve = data.autoApprove;
  await supabase.from('courses').update(updateData).eq('id', id);
}

export async function deleteCourse(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  await supabase.from('courses').delete().eq('id', id);
}

// ==========================================
// Bookings
// ==========================================
export async function createBooking(courseId: string, userId: string, userName: string, selectedDate: string, selectedTime: string, participants: number = 1, userPhone: string = '', status: string = 'pending'): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: res, error } = await supabase.from('bookings').insert({
    course_id: courseId, user_id: userId, user_name: userName, user_phone: userPhone, status,
    selected_date: selectedDate, selected_time: selectedTime, participants
  }).select('id').single();
  if (error) throw error;

  // Note: We no longer increment the global 'current_participants' on the course.
  // Bookings limits are calculated dynamically per time slot.

  return res.id;
}

export async function cancelBooking(bookingId: string, courseId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
  
  const { data: c } = await supabase.from('courses').select('current_participants').eq('id', courseId).single();
  if (c) {
    await supabase.from('courses').update({ current_participants: Math.max(0, (c.current_participants || 1) - 1) }).eq('id', courseId);
  }
}

export async function updateBookingStatus(bookingId: string, status: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  await supabase.from('bookings').update({ status }).eq('id', bookingId);
}

export async function getBookingsByUser(userId: string): Promise<Booking[]> {
  if (!supabase || !isSupabaseConfigured) return demoBookings;
  const { data } = await supabase.from('bookings')
    .select('*, courses(title, workshops(name))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  return (data || []).map(d => {
    const b = mapBooking(d);
    if (d.courses) {
      const cData = Array.isArray(d.courses) ? d.courses[0] : d.courses;
      if (cData) {
        b.courseTitle = cData.title;
        if (cData.workshops) {
          const wData = Array.isArray(cData.workshops) ? cData.workshops[0] : cData.workshops;
          b.workshopName = wData?.name;
        }
      }
    }
    return b;
  });
}

export async function getBookingsByInstructor(instructorId: string): Promise<Booking[]> {
  if (!supabase || !isSupabaseConfigured) return [];
  const { data } = await supabase.from('bookings')
    .select('*, courses!inner(instructor_id, title, workshops(name))')
    .eq('courses.instructor_id', instructorId)
    .order('created_at', { ascending: false });
    
  return (data || []).map(d => {
    const b = mapBooking(d);
    if (d.courses) {
      const cData = Array.isArray(d.courses) ? d.courses[0] : d.courses;
      if (cData) {
        b.courseTitle = cData.title;
        if (cData.workshops) {
          const wData = Array.isArray(cData.workshops) ? cData.workshops[0] : cData.workshops;
          b.workshopName = wData?.name;
        }
      }
    }
    return b;
  });
}

export async function getBookingsByCourse(courseId: string): Promise<Booking[]> {
  if (!supabase || !isSupabaseConfigured) return [];
  const { data } = await supabase.from('bookings').select('*').eq('course_id', courseId);
  return (data || []).map(mapBooking);
}

// ==========================================
// Reviews
// ==========================================
export async function getReviews(workshopId: string): Promise<Review[]> {
  if (!supabase || !isSupabaseConfigured) return demoReviews.filter(r => r.workshopId === workshopId);
  const { data } = await supabase.from('reviews').select('*').eq('workshop_id', workshopId).order('created_at', { ascending: false });
  return (data || []).map(mapReview);
}

export async function getAllReviews(): Promise<Review[]> {
  if (!supabase || !isSupabaseConfigured) return demoReviews;
  const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
  return (data || []).map(mapReview);
}

export async function getReviewsByUser(userId: string): Promise<Review[]> {
  if (!supabase || !isSupabaseConfigured) return demoReviews.slice(0, 3);
  const { data } = await supabase.from('reviews').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return (data || []).map(mapReview);
}

export async function addReview(data: Omit<Review, 'id' | 'createdAt'>): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: res, error } = await supabase.from('reviews').insert({
    workshop_id: data.workshopId, user_id: data.userId, user_name: data.userName,
    user_photo: data.userPhoto, rating: data.rating, text: data.text, locale: data.locale
  }).select('id').single();
  if (error) throw error;

  await updateWorkshopRating(data.workshopId);
  return res.id;
}

export async function updateReview(id: string, text: string, rating: number): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('reviews').update({ text, rating }).eq('id', id);
  if (error) throw error;
  
  const { data: rev } = await supabase.from('reviews').select('workshop_id').eq('id', id).single();
  if (rev?.workshop_id) {
    await updateWorkshopRating(rev.workshop_id);
  }
}

export async function deleteReview(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  // Get workshop_id before deleting
  const { data: rev } = await supabase.from('reviews').select('workshop_id').eq('id', id).single();
  
  await supabase.from('reviews').delete().eq('id', id);
  
  if (rev?.workshop_id) {
    await updateWorkshopRating(rev.workshop_id);
  }
}

async function updateWorkshopRating(workshopId: string) {
  if (!supabase) return;
  const { data: reviews } = await supabase.from('reviews').select('rating').eq('workshop_id', workshopId);
  if (reviews) {
    const newCount = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    const newRating = newCount > 0 ? sum / newCount : 0;
    const roundedRating = Math.round(newRating * 10) / 10;

    await supabase.from('workshops').update({ 
      review_count: newCount,
      rating: roundedRating
    }).eq('id', workshopId);
  }
}

// ==========================================
// Users
// ==========================================
export async function getUserProfileData(id: string): Promise<AppUser | null> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      id, email: 'instructor@example.com', displayName: '비바랩 마스터',
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
      role: 'instructor', createdAt: new Date().toISOString(), preferredLocale: 'ko',
    } as AppUser;
  }
  const { data } = await supabase.from('users').select('*').eq('id', id).single();
  return data ? mapUser(data) : null;
}
export { getUserProfileData as getUserProfile };

export async function updateUserProfile(id: string, data: { displayName?: string; photoURL?: string; bio?: string; email?: string }): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const updateData: any = {};
  if (data.displayName !== undefined) updateData.display_name = data.displayName;
  if (data.photoURL !== undefined) updateData.photo_url = data.photoURL;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.email !== undefined) updateData.email = data.email;
  
  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase.from('users').update(updateData).eq('id', id);
    if (error) throw error;
  }
}

export async function getAllUsers(): Promise<AppUser[]> {
  if (!supabase || !isSupabaseConfigured) return [];
  const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
  return (data || []).map(mapUser);
}

export async function updateUserRole(id: string, role: UserRole): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  await supabase.from('users').update({ role }).eq('id', id);
}

export async function toggleUserDisabled(id: string, disabled: boolean): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  await supabase.from('users').update({ disabled }).eq('id', id);
}

// ==========================================
// Inquiries
// ==========================================
export async function getInquiries(): Promise<Inquiry[]> {
  if (!supabase || !isSupabaseConfigured) return demoInquiries;
  const { data } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
  return (data || []).map(mapInquiry);
}

export async function createInquiry(data: Omit<Inquiry, 'id' | 'createdAt' | 'status' | 'reply'>): Promise<string> {
  if (!supabase || !isSupabaseConfigured) {
    const newInq = { ...data, id: `inq_${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() } as Inquiry;
    demoInquiries.unshift(newInq);
    return newInq.id;
  }
  const dbUserId = data.userId === 'guest' ? null : data.userId;
  const { data: res, error } = await supabase.from('inquiries').insert({
    user_id: dbUserId, user_name: data.userName, user_email: data.userEmail,
    title: data.title, category: data.category, content: data.content, status: 'pending'
  }).select('id').single();
  if (error) throw error;
  return res.id;
}

export async function updateInquiryReply(id: string, reply: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    const idx = demoInquiries.findIndex(i => i.id === id);
    if (idx > -1) { demoInquiries[idx].reply = reply; demoInquiries[idx].status = 'resolved'; }
    return;
  }
  await supabase.from('inquiries').update({ reply, status: 'resolved' }).eq('id', id);
}

// ==========================================
// Flea Markets
// ==========================================
export async function getFleaMarkets(): Promise<FleaMarket[]> {
  if (!supabase || !isSupabaseConfigured) return [];
  const { data } = await supabase.from('flea_markets').select('*').order('created_at', { ascending: false });
  return (data || []).map(mapFleaMarket);
}

export async function getFleaMarketsByCreator(creatorId: string): Promise<FleaMarket[]> {
  if (!supabase || !isSupabaseConfigured) return [];
  const { data } = await supabase.from('flea_markets').select('*').eq('creator_id', creatorId).order('created_at', { ascending: false });
  return (data || []).map(mapFleaMarket);
}

export async function getFleaMarketById(id: string): Promise<FleaMarket | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  const { data } = await supabase.from('flea_markets').select('*').eq('id', id).single();
  return data ? mapFleaMarket(data) : null;
}

export async function createFleaMarket(data: Omit<FleaMarket, 'id' | 'createdAt'>): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured');
  const insertData = {
    creator_id: data.creatorId, creator_name: data.creatorName, name: data.name,
    date: data.date, address: data.address, lat: data.lat, lng: data.lng,
    admission_fee: data.admissionFee, poster_url: data.posterUrl, images: data.images,
    description: data.description, phone: data.phone, website: data.website,
    instagram: data.instagram, youtube: data.youtube,
    vendor_application_link: data.vendorApplicationLink,
  };
  const { data: res, error } = await supabase.from('flea_markets').insert(insertData).select('id').single();
  if (error) throw error;
  return res.id;
}

export async function updateFleaMarket(id: string, data: Partial<FleaMarket>): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.date) updateData.date = data.date;
  if (data.address) updateData.address = data.address;
  if (data.lat !== undefined) updateData.lat = data.lat;
  if (data.lng !== undefined) updateData.lng = data.lng;
  if (data.admissionFee !== undefined) updateData.admission_fee = data.admissionFee;
  if (data.posterUrl !== undefined) updateData.poster_url = data.posterUrl;
  if (data.images !== undefined) updateData.images = data.images;
  if (data.description) updateData.description = data.description;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.website !== undefined) updateData.website = data.website;
  if (data.instagram !== undefined) updateData.instagram = data.instagram;
  if (data.youtube !== undefined) updateData.youtube = data.youtube;
  if (data.vendorApplicationLink !== undefined) updateData.vendor_application_link = data.vendorApplicationLink;
  if (data.status !== undefined) updateData.status = data.status;

  const { error } = await supabase.from('flea_markets').update(updateData).eq('id', id);
  if (error) {
    console.error('Update Flea Market Error:', error);
    throw error;
  }
}

export async function deleteFleaMarket(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  await supabase.from('flea_markets').delete().eq('id', id);
}

export async function incrementVendorApplicationClick(id: string): Promise<void> {
  if (!supabase) return;
  // We use an RPC call to avoid race conditions when incrementing clicks
  await supabase.rpc('increment_application_clicks', { market_id: id });
}

export async function getBookedParticipants(courseId: string, date: string, time: string): Promise<number> {
  if (!supabase) return 0;
  const { data, error } = await supabase.from('bookings')
    .select('participants')
    .eq('course_id', courseId)
    .eq('selected_date', date)
    .eq('selected_time', time)
    .eq('status', 'confirmed');
    
  if (error) {
    console.error('Failed to get booked participants', error);
    return 0;
  }
  
  return data.reduce((sum, b) => sum + (b.participants || 1), 0);
}

// ==========================================
// Notifications
// ==========================================
export async function getNotificationsByUser(userId: string): Promise<AppNotification[]> {
  if (!supabase || !isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Failed to get notifications', error);
    return [];
  }
  return (data || []).map(mapNotification);
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  if (!supabase || !isSupabaseConfigured) return 0;
  const { count, error } = await supabase.from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) return 0;
  return count || 0;
}

export async function createNotification(userId: string, title: string, message: string, linkUrl?: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('notifications').insert({
    user_id: userId, title, message, link_url: linkUrl, is_read: false
  });
}

export async function markNotificationAsRead(id: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
}

// ==========================================
// Storage
// ==========================================
export async function uploadImage(file: File, folder = 'uploads'): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured');
  
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

  const { data, error } = await supabase.storage.from('images').upload(fileName, file, {
    cacheControl: '3600',
    upsert: false
  });

  if (error) throw error;

  const { data: publicData } = supabase.storage.from('images').getPublicUrl(fileName);
  return publicData.publicUrl;
}

export async function listStorageImages(folder = 'uploads', limit = 100): Promise<{ name: string; url: string; created_at: string }[]> {
  if (!supabase) return [];
  
  const { data, error } = await supabase.storage.from('images').list(folder, {
    limit,
    sortBy: { column: 'created_at', order: 'desc' }
  });

  if (error || !data) {
    console.error('Failed to list images:', error);
    return [];
  }

  const validFiles = data.filter(f => f.name && f.name !== '.emptyFolderPlaceholder' && f.metadata);

  return validFiles.map(f => {
    const { data: publicData } = supabase!.storage.from('images').getPublicUrl(`${folder}/${f.name}`);
    return {
      name: f.name,
      url: publicData.publicUrl,
      created_at: f.created_at || new Date().toISOString(),
    };
  });
}

// ==========================================
// Notices (Announcements)
// ==========================================
const mapNotice = (d: any): Notice => ({
  id: d.id,
  title: d.title,
  content: d.content,
  isMain: d.is_main ?? false,
  isActive: d.is_active ?? true,
  authorName: d.author_name,
  createdAt: d.created_at,
});

function getLocalNotices(): Notice[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('demoNotices');
    if (saved) return JSON.parse(saved);
  }
  return [...demoNotices];
}

function saveLocalNotices(notices: Notice[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('demoNotices', JSON.stringify(notices));
  }
}

export async function getNotices(): Promise<Notice[]> {
  if (!supabase || !isSupabaseConfigured) return getLocalNotices();
  const { data, error } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
  if (error || !data) {
    return getLocalNotices(); // Fallback to demo data if table doesn't exist
  }
  return (data || []).map(mapNotice);
}

export async function getMainNotice(): Promise<Notice | null> {
  if (!supabase || !isSupabaseConfigured) {
    return getLocalNotices().find(n => n.isMain && n.isActive) || null;
  }
  const { data, error } = await supabase.from('notices')
    .select('*')
    .eq('is_main', true)
    .eq('is_active', true)
    .maybeSingle();
    
  if (error || !data) {
    return getLocalNotices().find(n => n.isMain && n.isActive) || null; // Fallback to demo data
  }
  return mapNotice(data);
}

export async function createNotice(data: Omit<Notice, 'id' | 'createdAt'>): Promise<string> {
  if (!supabase || !isSupabaseConfigured) {
    const newNotice = { ...data, id: `n_${Date.now()}`, createdAt: new Date().toISOString() };
    const local = getLocalNotices();
    local.unshift(newNotice);
    saveLocalNotices(local);
    return newNotice.id;
  }
  
  if (data.isMain) {
    await supabase.from('notices').update({ is_main: false }).eq('is_main', true);
  }

  const { data: res, error } = await supabase.from('notices').insert({
    title: data.title, content: data.content, is_main: data.isMain, is_active: data.isActive, author_name: data.authorName
  }).select('id').single();
  
  if (error) {
    console.warn("Supabase insert failed, falling back to local memory:", error);
    const newNotice = { ...data, id: `n_${Date.now()}`, createdAt: new Date().toISOString() };
    const local = getLocalNotices();
    local.unshift(newNotice);
    saveLocalNotices(local);
    return newNotice.id;
  }
  return res.id;
}

export async function updateNotice(id: string, data: Partial<Notice>): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    const local = getLocalNotices();
    const idx = local.findIndex(n => n.id === id);
    if (idx > -1) {
      if (data.isMain) {
        local.forEach(n => n.isMain = false);
      }
      local[idx] = { ...local[idx], ...data };
      saveLocalNotices(local);
    }
    return;
  }
  
  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.isActive !== undefined) updateData.is_active = data.isActive;
  if (data.isMain !== undefined) {
    updateData.is_main = data.isMain;
    if (data.isMain) {
      await supabase.from('notices').update({ is_main: false }).eq('is_main', true);
    }
  }

  const { error } = await supabase.from('notices').update(updateData).eq('id', id);
  if (error) {
    console.warn("Supabase update failed, falling back to local memory:", error);
    const local = getLocalNotices();
    const idx = local.findIndex(n => n.id === id);
    if (idx > -1) {
      if (data.isMain) {
        local.forEach(n => n.isMain = false);
      }
      local[idx] = { ...local[idx], ...data };
      saveLocalNotices(local);
    }
    return;
  }
}

export async function deleteNotice(id: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    const local = getLocalNotices();
    const idx = local.findIndex(n => n.id === id);
    if (idx > -1) {
      local.splice(idx, 1);
      saveLocalNotices(local);
    }
    return;
  }
  const { error } = await supabase.from('notices').delete().eq('id', id);
  if (error) {
    console.warn("Supabase delete failed, falling back to local memory:", error);
    const local = getLocalNotices();
    const idx = local.findIndex(n => n.id === id);
    if (idx > -1) {
      local.splice(idx, 1);
      saveLocalNotices(local);
    }
  }
}

// ==========================================
// Analytics: Click Trends & Traffic Sources
// ==========================================

export interface ClickTrendItem {
  date: string;
  label: string;
  totalClicks: number;
  mapPinClicks: number;
  listClicks: number;
  externalClicks: number;
}

export interface ClicksByTypeItem {
  name: string;
  value: number;
}

const LINK_TYPE_LABELS: Record<string, string> = {
  map_pin: '지도 핀 클릭',
  list_item: '리스트 클릭',
  website: '웹사이트',
  instagram: '인스타그램',
  youtube: '유튜브',
  nav: '길찾기',
  share: '공유',
};

/**
 * Fetch daily click trends from workshop_clicks table.
 */
export async function getClickTrends(startDate: string, endDate: string): Promise<ClickTrendItem[]> {
  if (!supabase || !isSupabaseConfigured) {
    return generateDemoTrends(startDate, endDate);
  }

  const { data, error } = await supabase
    .from('workshop_clicks')
    .select('link_type, created_at')
    .gte('created_at', `${startDate}T00:00:00`)
    .lte('created_at', `${endDate}T23:59:59`)
    .order('created_at', { ascending: true });

  if (error || !data) {
    console.warn('Failed to fetch click trends:', error);
    return generateDemoTrends(startDate, endDate);
  }

  const grouped: Record<string, { total: number; mapPin: number; list: number; external: number }> = {};
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split('T')[0];
    grouped[key] = { total: 0, mapPin: 0, list: 0, external: 0 };
  }

  for (const row of data) {
    const dateKey = new Date(row.created_at).toISOString().split('T')[0];
    if (!grouped[dateKey]) {
      grouped[dateKey] = { total: 0, mapPin: 0, list: 0, external: 0 };
    }
    grouped[dateKey].total += 1;
    if (row.link_type === 'map_pin') grouped[dateKey].mapPin += 1;
    else if (row.link_type === 'list_item') grouped[dateKey].list += 1;
    else grouped[dateKey].external += 1;
  }

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({
      date,
      label: `${date.slice(5, 7)}/${date.slice(8, 10)}`,
      totalClicks: counts.total,
      mapPinClicks: counts.mapPin,
      listClicks: counts.list,
      externalClicks: counts.external,
    }));
}

/**
 * Fetch click breakdown by link_type from workshop_clicks table.
 */
export async function getClicksByType(startDate: string, endDate: string): Promise<ClicksByTypeItem[]> {
  if (!supabase || !isSupabaseConfigured) {
    return generateDemoClicksByType();
  }

  const { data, error } = await supabase
    .from('workshop_clicks')
    .select('link_type')
    .gte('created_at', `${startDate}T00:00:00`)
    .lte('created_at', `${endDate}T23:59:59`);

  if (error || !data) {
    console.warn('Failed to fetch clicks by type:', error);
    return generateDemoClicksByType();
  }

  const counts: Record<string, number> = {};
  for (const row of data) {
    counts[row.link_type] = (counts[row.link_type] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([type, value]) => ({
      name: LINK_TYPE_LABELS[type] || type,
      value,
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Get total click count for a date range.
 */
export async function getTotalClicks(startDate: string, endDate: string): Promise<number> {
  if (!supabase || !isSupabaseConfigured) {
    return generateDemoTrends(startDate, endDate).reduce((sum, d) => sum + d.totalClicks, 0);
  }

  const { count, error } = await supabase
    .from('workshop_clicks')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${startDate}T00:00:00`)
    .lte('created_at', `${endDate}T23:59:59`);

  if (error) {
    console.warn('Failed to fetch total clicks:', error);
    return 0;
  }
  return count || 0;
}

// Demo fallback data generators
function generateDemoTrends(startDate: string, endDate: string): ClickTrendItem[] {
  const results: ClickTrendItem[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const mapPin = Math.floor(Math.random() * 30) + 5;
    const list = Math.floor(Math.random() * 20) + 3;
    const external = Math.floor(Math.random() * 15) + 2;
    results.push({
      date: dateStr,
      label: `${dateStr.slice(5, 7)}/${dateStr.slice(8, 10)}`,
      totalClicks: mapPin + list + external,
      mapPinClicks: mapPin,
      listClicks: list,
      externalClicks: external,
    });
  }
  return results;
}

function generateDemoClicksByType(): ClicksByTypeItem[] {
  return [
    { name: '지도 핀 클릭', value: 245 },
    { name: '리스트 클릭', value: 182 },
    { name: '길찾기', value: 97 },
    { name: '인스타그램', value: 78 },
    { name: '웹사이트', value: 56 },
    { name: '유튜브', value: 34 },
    { name: '공유', value: 23 },
  ];
}
