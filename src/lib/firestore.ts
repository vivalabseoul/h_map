// ==========================================
// Firestore CRUD Operations
// ==========================================
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type {
  Workshop,
  Course,
  Booking,
  Review,
  UserRole,
  Inquiry,
} from '@/types';
import { demoWorkshops, demoReviews, demoCourses, demoBookings, demoInquiries } from '@/data/workshops';

// ==========================================
// Workshops
// ==========================================
export async function getWorkshops(): Promise<Workshop[]> {
  if (!db || !isFirebaseConfigured) return demoWorkshops;
  try {
    const q = query(collection(db, 'workshops'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return demoWorkshops;
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Workshop));
  } catch {
    return demoWorkshops;
  }
}

export async function getWorkshopsByOwner(ownerId: string): Promise<Workshop[]> {
  if (!db || !isFirebaseConfigured) return demoWorkshops.filter((w) => w.ownerId === ownerId);
  try {
    const q = query(collection(db, 'workshops'), where('ownerId', '==', ownerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Workshop));
  } catch {
    return [];
  }
}

export async function getWorkshopById(id: string): Promise<Workshop | null> {
  if (!db || !isFirebaseConfigured) return demoWorkshops.find((w) => w.id === id) || null;
  try {
    const docRef = doc(db, 'workshops', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Workshop) : null;
  } catch {
    return null;
  }
}

export async function createWorkshop(data: Omit<Workshop, 'id' | 'createdAt' | 'rating' | 'reviewCount'>): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  const docRef = await addDoc(collection(db, 'workshops'), {
    ...data,
    rating: 0,
    reviewCount: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateWorkshop(id: string, data: Partial<Workshop>): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const docRef = doc(db, 'workshops', id);
  const { id: _id, ...updateData } = data;
  void _id;
  await updateDoc(docRef, updateData);
}

export async function deleteWorkshop(id: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  await deleteDoc(doc(db, 'workshops', id));
}

// ==========================================
// Courses
// ==========================================
export async function getCourses(): Promise<Course[]> {
  if (!db || !isFirebaseConfigured) return demoCourses;
  try {
    const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return demoCourses;
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Course));
  } catch {
    return demoCourses;
  }
}

export async function getCoursesByWorkshop(workshopId: string): Promise<Course[]> {
  if (!db || !isFirebaseConfigured) return demoCourses.filter((c) => c.workshopId === workshopId);
  try {
    const q = query(collection(db, 'courses'), where('workshopId', '==', workshopId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return demoCourses.filter((c) => c.workshopId === workshopId);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Course));
  } catch {
    return demoCourses.filter((c) => c.workshopId === workshopId);
  }
}

export async function getCoursesByInstructor(instructorId: string): Promise<Course[]> {
  if (!db || !isFirebaseConfigured) return demoCourses.filter((c) => c.instructorId === instructorId);
  try {
    const q = query(collection(db, 'courses'), where('instructorId', '==', instructorId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Course));
  } catch {
    return [];
  }
}

export async function createCourse(data: Omit<Course, 'id' | 'createdAt' | 'currentParticipants'>): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  const docRef = await addDoc(collection(db, 'courses'), {
    ...data,
    currentParticipants: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateCourse(id: string, data: Partial<Course>): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const docRef = doc(db, 'courses', id);
  const { id: _id, ...updateData } = data;
  void _id;
  await updateDoc(docRef, updateData);
}

export async function deleteCourse(id: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  await deleteDoc(doc(db, 'courses', id));
}

// ==========================================
// Bookings
// ==========================================
export async function createBooking(courseId: string, userId: string, userName: string): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  const docRef = await addDoc(collection(db, 'bookings'), {
    courseId,
    userId,
    userName,
    status: 'confirmed',
    createdAt: serverTimestamp(),
  });
  // Increment participant count
  const courseRef = doc(db, 'courses', courseId);
  await updateDoc(courseRef, { currentParticipants: increment(1) });
  return docRef.id;
}

export async function cancelBooking(bookingId: string, courseId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const bookingRef = doc(db, 'bookings', bookingId);
  await updateDoc(bookingRef, { status: 'cancelled' });
  const courseRef = doc(db, 'courses', courseId);
  await updateDoc(courseRef, { currentParticipants: increment(-1) });
}

export async function updateBookingStatus(bookingId: string, status: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const bookingRef = doc(db, 'bookings', bookingId);
  await updateDoc(bookingRef, { status });
}

export async function getBookingsByUser(userId: string): Promise<Booking[]> {
  if (!db || !isFirebaseConfigured) return demoBookings;
  try {
    const q = query(collection(db, 'bookings'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
  } catch {
    return [];
  }
}

export async function getBookingsByCourse(courseId: string): Promise<Booking[]> {
  if (!db || !isFirebaseConfigured) return [];
  try {
    const q = query(collection(db, 'bookings'), where('courseId', '==', courseId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
  } catch {
    return [];
  }
}

// ==========================================
// Reviews
// ==========================================
export async function getReviews(workshopId: string): Promise<Review[]> {
  if (!db || !isFirebaseConfigured) return demoReviews.filter((r) => r.workshopId === workshopId);
  try {
    const q = query(
      collection(db, 'reviews'),
      where('workshopId', '==', workshopId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return demoReviews.filter((r) => r.workshopId === workshopId);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
  } catch {
    return demoReviews.filter((r) => r.workshopId === workshopId);
  }
}

export async function getReviewsByUser(userId: string): Promise<Review[]> {
  if (!db || !isFirebaseConfigured) return demoReviews.slice(0, 3); // Return some mock reviews
  try {
    const q = query(collection(db, 'reviews'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
  } catch {
    return [];
  }
}

export async function addReview(data: Omit<Review, 'id' | 'createdAt'>): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  const docRef = await addDoc(collection(db, 'reviews'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  // Update workshop rating
  const workshopRef = doc(db, 'workshops', data.workshopId);
  await updateDoc(workshopRef, { reviewCount: increment(1) });
  return docRef.id;
}

export async function deleteReview(id: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  await deleteDoc(doc(db, 'reviews', id));
}

// ==========================================
// Users
// ==========================================
export async function getUserProfile(uid: string): Promise<AppUser | null> {
  if (!db || !isFirebaseConfigured) {
    return {
      uid,
      email: 'instructor@example.com',
      displayName: '비바랩 마스터',
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
      role: 'instructor',
      createdAt: new Date().toISOString(),
      preferredLocale: 'ko',
      bio: '안녕하세요! 즐거운 공예 시간을 만들어 드릴 강사입니다.',
    } as AppUser;
  }
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ ...docSnap.data(), uid: docSnap.id } as AppUser) : null;
  } catch {
    return null;
  }
}

export async function getAllUsers(): Promise<AppUser[]> {
  if (!db || !isFirebaseConfigured) return [];
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ ...d.data(), uid: d.id } as AppUser));
  } catch {
    return [];
  }
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { role });
}

export async function toggleUserDisabled(uid: string, disabled: boolean): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { disabled });
}

// ==========================================
// Inquiries (Contact Us)
// ==========================================
export async function getInquiries(): Promise<Inquiry[]> {
  if (!db || !isFirebaseConfigured) return demoInquiries;
  try {
    const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return demoInquiries;
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Inquiry));
  } catch {
    return demoInquiries;
  }
}

export async function createInquiry(data: Omit<Inquiry, 'id' | 'createdAt' | 'status' | 'reply'>): Promise<string> {
  if (!db || !isFirebaseConfigured) {
    // Mock create
    const newInq: Inquiry = {
      ...data,
      id: `inq_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    demoInquiries.unshift(newInq);
    return newInq.id;
  }
  const docRef = await addDoc(collection(db, 'inquiries'), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function updateInquiryReply(id: string, reply: string): Promise<void> {
  if (!db || !isFirebaseConfigured) {
    // Mock update
    const idx = demoInquiries.findIndex(i => i.id === id);
    if (idx > -1) {
      demoInquiries[idx].reply = reply;
      demoInquiries[idx].status = 'resolved';
    }
    return;
  }
  const docRef = doc(db, 'inquiries', id);
  await updateDoc(docRef, { reply, status: 'resolved' });
}
