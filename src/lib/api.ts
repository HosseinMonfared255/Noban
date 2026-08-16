/**
 * API Client for Noban
 * تمام توابع ارتباط با بک‌اند و Supabase
 */

import { supabase } from './supabase'
import type { User, Doctor, Specialty, Appointment, Review, Favorite, Notification, Availability } from '@prisma/client'

// ====================== Doctors API ======================

export async function getAllDoctors(): Promise<Doctor[]> {
  const { data, error } = await supabase
    .from('Doctor')
    .select('*, specialty:Specialty(*)')
    .eq('isActive', true)
    .order('rating', { ascending: false })

  if (error) throw error
  return data as unknown as Doctor[]
}

export async function getDoctorBySlug(slug: string): Promise<Doctor | null> {
  const { data, error } = await supabase
    .from('Doctor')
    .select('*, specialty:Specialty(*), availabilities:Availability(*)')
    .eq('slug', slug)
    .eq('isActive', true)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as unknown as Doctor | null
}

export async function getDoctorsBySpecialty(specialtyId: string): Promise<Doctor[]> {
  const { data, error } = await supabase
    .from('Doctor')
    .select('*, specialty:Specialty(*)')
    .eq('specialtyId', specialtyId)
    .eq('isActive', true)
    .order('rating', { ascending: false })

  if (error) throw error
  return data as unknown as Doctor[]
}

// ====================== Specialties API ======================

export async function getAllSpecialties(): Promise<Specialty[]> {
  const { data, error } = await supabase
    .from('Specialty')
    .select('*')
    .order('sortOrder', { ascending: true })

  if (error) throw error
  return data as Specialty[]
}

// ====================== Appointments API ======================

export async function createAppointment(appointment: {
  userId: string
  doctorId: string
  dayName: string
  date: string
  slot: string
  patientName: string
  patientPhone: string
  insurance: string
  fee: number
  trackingCode: string
}): Promise<Appointment> {
  const { data, error } = await supabase
    .from('Appointment')
    .insert([appointment])
    .select()
    .single()

  if (error) throw error
  return data as Appointment
}

export async function getUserAppointments(userId: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('Appointment')
    .select('*, doctor:Doctor(*)')
    .eq('userId', userId)
    .order('createdAt', { ascending: false })

  if (error) throw error
  return data as unknown as Appointment[]
}

export async function cancelAppointment(id: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from('Appointment')
    .update({ status: 'cancelled', cancelReason: reason })
    .eq('id', id)

  if (error) throw error
}

// ====================== Reviews API ======================

export async function getDoctorReviews(doctorId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('Review')
    .select('*, user:User(*)')
    .eq('doctorId', doctorId)
    .order('createdAt', { ascending: false })

  if (error) throw error
  return data as unknown as Review[]
}

export async function createReview(review: {
  userId: string
  doctorId: string
  rating: number
  text: string
}): Promise<Review> {
  const { data, error } = await supabase
    .from('Review')
    .insert([review])
    .select()
    .single()

  if (error) throw error
  return data as Review
}

// ====================== Favorites API ======================

export async function getUserFavorites(userId: string): Promise<Favorite[]> {
  const { data, error } = await supabase
    .from('Favorite')
    .select('*, doctor:Doctor(*)')
    .eq('userId', userId)

  if (error) throw error
  return data as unknown as Favorite[]
}

export async function toggleFavorite(userId: string, doctorId: string): Promise<void> {
  // Check if exists
  const { data: existing } = await supabase
    .from('Favorite')
    .select('id')
    .eq('userId', userId)
    .eq('doctorId', doctorId)
    .single()

  if (existing) {
    // Remove
    await supabase.from('Favorite').delete().eq('userId', userId).eq('doctorId', doctorId)
  } else {
    // Add
    await supabase.from('Favorite').insert([{ userId, doctorId }])
  }
}

// ====================== User API ======================

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('User')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as User | null
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('User')
    .select('*')
    .eq('phone', phone)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as User | null
}

export async function createUser(user: {
  phone: string
  firstName: string
  lastName: string
}): Promise<User> {
  const { data, error } = await supabase
    .from('User')
    .insert([user])
    .select()
    .single()

  if (error) throw error
  return data as User
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  const { data, error } = await supabase
    .from('User')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as User
}

// ====================== Health Tips (Static for now) ======================

export interface HealthTip {
  id: number
  category: string
  title: string
  excerpt: string
  readTime: string
  color: string
  emoji: string
  author: string
  date: string
  content: { heading: string; body: string }[]
}

export function getHealthTips(): HealthTip[] {
  // For now, return empty array - can be moved to DB later
  return []
}

export function getHealthTipById(id: number): HealthTip | null {
  return null
}

// ====================== FAQ (Static for now) ======================

export interface FaqItem {
  q: string
  a: string
}

export function getFaqs(): FaqItem[] {
  return [
    {
      q: "رزرو نوبت از طریق نوبان چقدر طول می‌کشد؟",
      a: "کمتر از یک دقیقه! کافی است تخصص و پزشک موردنظر را انتخاب کنید، زمان آزاد را ببینید و با وارد کردن اطلاعات پایه، نوبت خود را ثبت کنید. کد پیگیری بلافاصله برای شما ارسال می‌شود.",
    },
    {
      q: "آیا برای استفاده از نوبان نیاز به ثبت‌نام است؟",
      a: "خیر، می‌توانید به‌صورت مهمان نیز نوبت بگیرید. اما با ساخت حساب کاربری، از مزایای پرونده دیجیتال، یادآور هوشمند و تاریخچه ویزیت‌ها بهره‌مند می‌شوید.",
    },
    {
      q: "در صورت کنسلی نوبت چه باید کرد؟",
      a: "تا ۲ ساعت قبل از زمان ویزیت، می‌توانید نوبت خود را از پنل کاررسی کنسل یا به زمان دیگری منتقل کنید. مبلغ ویزیت در صورت کنسلی به‌موقع، کامل بازگردانده می‌شود.",
    },
    {
      q: "آیا اطلاعات پزشکی من امن است؟",
      a: "بله. تمامی اطلاعات با رمزنگاری سطح بانکی (AES-256) ذخیره می‌شوند و حریم خصوصی شما طبق قانون حفظ حریم خصوصی پزشکی کاملاً محرمانه می‌ماند.",
    },
  ]
}

// ====================== Features (Static) ======================

export interface Feature {
  icon: string
  title: string
  desc: string
}

export function getFeatures(): Feature[] {
  return [
    {
      icon: "calendar",
      title: "رزرو آنلاین فوری",
      desc: "بدون انتظار در صف تلفن، در کمتر از یک دقیقه نوبت بگیرید؛ شبانه‌روزی و در هر مکان.",
    },
    {
      icon: "bell",
      title: "یادآور هوشمند",
      desc: "پیامک و اعلان پیش از ویزیت تا هیچ نوبتی را از قلم نیندازید و زمان را دقیق مدیریت کنید.",
    },
    {
      icon: "shield",
      title: "حریم خصوصی امن",
      desc: "اطلاعات پزشکی شما با رمزنگاری سطح بانکی محافظت می‌شود و کاملاً محرمانه می‌ماند.",
    },
    {
      icon: "clock",
      title: "نوبت‌دهی یکپارچه",
      desc: "تقویم زنده‌ی ده‌ها مطب و تخصص در یک پنل، با امکان کنسلی و جابه‌جایی آنی.",
    },
    {
      icon: "stethoscope",
      title: "تخصص‌های گوناگون",
      desc: "از قلب و عروق تا اطفال و دندان‌پزشکی؛ بهترین متخصصان شهر در دسترس شما.",
    },
    {
      icon: "chart",
      title: "پرونده دیجیتال",
      desc: "تاریخچه‌ی ویزیت‌ها، نسخه‌ها و آزمایش‌ها همیشه همراه شما و قابل اشتراک‌گذاری.",
    },
  ]
}

// ====================== Testimonials (Static for now) ======================

export interface Testimonial {
  name: string
  role: string
  text: string
  avatar: string
  color: string
}

export function getTestimonials(): Testimonial[] {
  return [
    {
      name: "نگار حسینی",
      role: "بیمار",
      text: "دیگر ساعت‌ها منتظر تلفن نمی‌مانم؛ نوبت قلب را در یک دقیقه گرفتم و پیامک یادآور هم داشت.",
      avatar: "ن",
      color: "from-cyan-400 to-blue-500",
    },
    {
      name: "محمد قاسمی",
      role: "بیمار",
      text: "پرونده دیجیتال عالیه؛ نسخه‌ها و آزمایش‌های قبلیم همه در یک جا و قابل ارسال برای پزشک.",
      avatar: "م",
      color: "from-violet-400 to-fuchsia-500",
    },
    {
      name: "سمیرا کریمی",
      role: "مادر",
      text: "برای ویزیت اطفالم همیشه سریع نوبت پیدا می‌کنم. رابط کاربری ساده و زیباست.",
      avatar: "س",
      color: "from-emerald-400 to-teal-500",
    },
  ]
}

// ====================== Contact Info (Static) ======================

export const contactInfo = {
  phone: "۰۲۱-۹۱۰۰ ۰۰۰۰",
  email: "info@noban.ir",
  address: "درگز، خیابان امام، ساختمان پزشکان نوبان",
  workingHours: "شنبه تا پنجشنبه، ۸ صبح تا ۸ شب",
  socialMedia: [
    { name: "اینستاگرام", icon: "📸", url: "#" },
    { name: "تلگرام", icon: "✈️", url: "#" },
    { name: "واتساپ", icon: "💬", url: "#" },
  ],
}

// ====================== Nav Links (Static) ======================

export const navLinks = [
  { href: "#home", label: "خانه" },
  { href: "#features", label: "ویژگی‌ها" },
  { href: "#specialties", label: "تخصص‌ها" },
  { href: "#doctors", label: "پزشکان" },
  { href: "#how", label: "نحوه کار" },
  { href: "#booking", label: "رزرو نوبت" },
]
