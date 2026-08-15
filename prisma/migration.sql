-- ===========================================================
-- Noban Database Schema for Supabase (PostgreSQL)
-- سامانه هوشمند رزرو نوبت پزشک
-- ===========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ۱. کاربران — بیماران عادی سایت
CREATE TABLE "User" (
  id TEXT PRIMARY KEY DEFAULT CONCAT('user_', gen_random_uuid()::text),
  phone TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  avatar TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "User_phone_idx" ON "User"("phone");

-- ۲. تخصص‌های پزشکی
CREATE TABLE "Specialty" (
  id TEXT PRIMARY KEY DEFAULT CONCAT('spec_', gen_random_uuid()::text),
  name TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL,
  "doctorCount" INTEGER NOT NULL DEFAULT 0,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Specialty_sortOrder_idx" ON "Specialty"("sortOrder");

-- ۳. پزشکان
CREATE TABLE "Doctor" (
  id TEXT PRIMARY KEY DEFAULT CONCAT('doc_', gen_random_uuid()::text),
  slug TEXT UNIQUE NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "specialtyId" TEXT NOT NULL,
  photo TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  location TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  about TEXT NOT NULL,
  experience INTEGER NOT NULL,
  fee INTEGER NOT NULL,
  rating DOUBLE PRECISION NOT NULL DEFAULT 0,
  "reviewCount" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "Doctor_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty"(id)
);

CREATE INDEX "Doctor_specialtyId_idx" ON "Doctor"("specialtyId");
CREATE INDEX "Doctor_isActive_idx" ON "Doctor"("isActive");

-- ۴. نوبت‌ها
CREATE TABLE "Appointment" (
  id TEXT PRIMARY KEY DEFAULT CONCAT('apt_', gen_random_uuid()::text),
  "trackingCode" TEXT UNIQUE NOT NULL,
  "userId" TEXT NOT NULL,
  "doctorId" TEXT NOT NULL,
  "dayName" TEXT NOT NULL,
  date TEXT NOT NULL,
  slot TEXT NOT NULL,
  "patientName" TEXT NOT NULL,
  "patientPhone" TEXT NOT NULL,
  insurance TEXT NOT NULL DEFAULT 'بیمه پایه',
  fee INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming',
  "cancelReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id),
  CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"(id)
);

CREATE INDEX "Appointment_userId_status_idx" ON "Appointment"("userId", "status");
CREATE INDEX "Appointment_doctorId_status_idx" ON "Appointment"("doctorId", "status");
CREATE INDEX "Appointment_date_slot_idx" ON "Appointment"("date", "slot");

-- ۵. نظرات
CREATE TABLE "Review" (
  id TEXT PRIMARY KEY DEFAULT CONCAT('rev_', gen_random_uuid()::text),
  "userId" TEXT NOT NULL,
  "doctorId" TEXT NOT NULL,
  rating INTEGER NOT NULL,
  text TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id),
  CONSTRAINT "Review_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"(id),
  CONSTRAINT "Review_unique_user_doctor" UNIQUE ("userId", "doctorId")
);

CREATE INDEX "Review_doctorId_idx" ON "Review"("doctorId");

-- ۶. علاقه‌مندی‌ها
CREATE TABLE "Favorite" (
  "userId" TEXT NOT NULL,
  "doctorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "Favorite_pkey" PRIMARY KEY ("userId", "doctorId"),
  CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id),
  CONSTRAINT "Favorite_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"(id)
);

CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- ۷. اعلان‌ها
CREATE TABLE "Notification" (
  id TEXT PRIMARY KEY DEFAULT CONCAT('notif_', gen_random_uuid()::text),
  "userId" TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id)
);

CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- ۸. تاریخچه ورود
CREATE TABLE "LoginEvent" (
  id TEXT PRIMARY KEY DEFAULT CONCAT('login_', gen_random_uuid()::text),
  "userId" TEXT NOT NULL,
  method TEXT NOT NULL,
  device TEXT NOT NULL,
  ip TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "LoginEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id)
);

CREATE INDEX "LoginEvent_userId_idx" ON "LoginEvent"("userId");

-- ۹. کدهای OTP
CREATE TABLE "OtpCode" (
  id TEXT PRIMARY KEY DEFAULT CONCAT('otp_', gen_random_uuid()::text),
  "userId" TEXT NOT NULL,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'login',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "isUsed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "OtpCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id)
);

CREATE INDEX "OtpCode_userId_isUsed_idx" ON "OtpCode"("userId", "isUsed");
CREATE INDEX "OtpCode_expiresAt_idx" ON "OtpCode"("expiresAt");

-- ۱۰. زمان‌بندی پزشک
CREATE TABLE "Availability" (
  id TEXT PRIMARY KEY DEFAULT CONCAT('avail_', gen_random_uuid()::text),
  "doctorId" TEXT NOT NULL,
  "dayOfWeek" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "slotDuration" INTEGER NOT NULL DEFAULT 30,
  "isClosed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "Availability_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"(id),
  CONSTRAINT "Availability_unique_doctor_day" UNIQUE ("doctorId", "dayOfWeek")
);

CREATE INDEX "Availability_doctorId_idx" ON "Availability"("doctorId");

