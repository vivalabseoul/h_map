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
} from '@/types';
import { demoWorkshops, demoReviews, demoCourses, demoBookings, demoInquiries } from '@/data/workshops';

// --- Mappers (snake_case -> camelCase) ---
const mapWorkshop = (d: any): Workshop => ({
  id: d.id, ownerId: d.owner_id, ownerName: d.owner_name, name: d.name, category: d.category,
  description: d.description, address: d.address, lat: d.lat, lng: d.lng,
  images: d.images || [], rating: d.rating, reviewCount: d.review_count,
  tags: d.tags || [], phone: d.phone, website: d.website, snsLinks: d.sns_links,
  region: d.region, status: d.status, createdAt: d.created_at,
});
const mapCourse = (d: any): Course => ({
  id: d.id, workshopId: d.workshop_id, instructorId: d.instructor_id, instructorName: d.instructor_name,
  title: d.title, description: d.description, price: d.price, duration: d.duration,
  maxParticipants: d.max_participants, currentParticipants: d.current_participants,
  status: d.status, imageUrl: d.image_url, startDate: d.start_date, endDate: d.end_date,
  availableDays: d.available_days || [], availableTimes: d.available_times || [],
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
  id: d.id, creatorId: d.creator_id, creatorName: d.creator_name, name: d.name,
  date: d.date, address: d.address, lat: d.lat, lng: d.lng, admissionFee: d.admission_fee,
  posterUrl: d.poster_url, images: d.images || [], description: d.description,
  phone: d.phone, website: d.website, instagram: d.instagram, youtube: d.youtube,
  vendorApplicationLink: d.vendor_application_link,
  applicationClicks: d.application_clicks || 0,
  source: d.source || 'user',
  externalId: d.external_id,
  status: d.status || 'active',
  createdAt: d.created_at,
});

// ==========================================
// Workshops
// ==========================================
export async function getWorkshops(): Promise<Workshop[]> {
  if (!supabase || !isSupabaseConfigured) return demoWorkshops;
  const { data } = await supabase.from('workshops').select('*').order('created_at', { ascending: false });
  return (data || []).map(mapWorkshop);
}

export async function getWorkshopsByOwner(ownerId: string): Promise<Workshop[]> {
  if (!supabase || !isSupabaseConfigured) return demoWorkshops.filter(w => w.ownerId === ownerId);
  const { data } = await supabase.from('workshops').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false });
  return (data || []).map(mapWorkshop);
}

export async function getWorkshopById(id: string): Promise<Workshop | null> {
  if (!supabase || !isSupabaseConfigured) return demoWorkshops.find(w => w.id === id) || null;
  const { data } = await supabase.from('workshops').select('*').eq('id', id).single();
  return data ? mapWorkshop(data) : null;
}

export async function createWorkshop(data: Omit<Workshop, 'id' | 'createdAt' | 'rating' | 'reviewCount'>): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured');
  const insertData = {
    owner_id: data.ownerId, owner_name: data.ownerName, name: data.name, category: data.category,
    description: data.description, address: data.address, lat: data.lat, lng: data.lng,
    images: data.images, tags: data.tags, phone: data.phone, website: data.website,
    sns_links: data.snsLinks, region: data.region, status: data.status,
  };
  const { data: res, error } = await supabase.from('workshops').insert(insertData).select('id').single();
  if (error) throw error;
  return res.id;
}

export async function updateWorkshop(id: string, data: Partial<Workshop>): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.description) updateData.description = data.description;
  if (data.address) updateData.address = data.address;
  if (data.category) updateData.category = data.category;
  if (data.status) updateData.status = data.status;
  if (data.images) updateData.images = data.images;
  if (data.phone) updateData.phone = data.phone;
  
  await supabase.from('workshops').update(updateData).eq('id', id);
}

export async function deleteWorkshop(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  await supabase.from('workshops').delete().eq('id', id);
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
    max_participants: data.maxParticipants, status: data.status, image_url: data.imageUrl,
    start_date: data.startDate, end_date: data.endDate, 
    available_days: data.availableDays, available_times: data.availableTimes,
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
  if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;
  if (data.startDate) updateData.start_date = data.startDate;
  if (data.endDate) updateData.end_date = data.endDate;
  if (data.availableDays) updateData.available_days = data.availableDays;
  if (data.availableTimes) updateData.available_times = data.availableTimes;
  await supabase.from('courses').update(updateData).eq('id', id);
}

export async function deleteCourse(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  await supabase.from('courses').delete().eq('id', id);
}

// ==========================================
// Bookings
// ==========================================
export async function createBooking(courseId: string, userId: string, userName: string, selectedDate: string, selectedTime: string, participants: number = 1, userPhone: string = ''): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: res, error } = await supabase.from('bookings').insert({
    course_id: courseId, user_id: userId, user_name: userName, user_phone: userPhone, status: 'confirmed',
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
      b.courseTitle = d.courses.title;
      if (d.courses.workshops) {
        b.workshopName = d.courses.workshops.name;
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
      b.courseTitle = d.courses.title;
      if (d.courses.workshops) {
        b.workshopName = d.courses.workshops.name;
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

export async function updateUserProfile(id: string, data: { displayName?: string; photoURL?: string; bio?: string }): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const updateData: any = {};
  if (data.displayName !== undefined) updateData.display_name = data.displayName;
  if (data.photoURL !== undefined) updateData.photo_url = data.photoURL;
  if (data.bio !== undefined) updateData.bio = data.bio;
  
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
  const { data: res, error } = await supabase.from('inquiries').insert({
    user_id: data.userId, user_name: data.userName, user_email: data.userEmail,
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
