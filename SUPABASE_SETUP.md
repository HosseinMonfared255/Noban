# راهنمای راه‌اندازی Supabase برای پروژه Noban

## مراحل راه‌اندازی

### ۱. ساخت پروژه در Supabase
1. به https://supabase.com بروید
2. یک حساب کاربری بسازید یا وارد شوید
3. روی "New Project" کلیک کنید
4. اطلاعات پروژه را وارد کنید:
   - Name: `noban` (یا هر نام دلخواه)
   - Database Password: یک رمز عبور قوی انتخاب کنید
   - Region: نزدیک‌ترین منطقه به کاربران خود را انتخاب کنید

### ۲. دریافت کلیدهای API
پس از ساخت پروژه:
1. به Settings > API بروید
2. مقادیر زیر را کپی کنید:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (این را مخفی نگه دارید!)

### ۳. ساخت فایل .env.local
در ریشه پروژه، فایل `.env.local` را بسازید:

```bash
cp .env.local.example .env.local
```

سپس مقادیر را در فایل `.env.local` قرار دهید:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### ۴. اجرای Migration در Supabase

#### روش اول: استفاده از Prisma Migrate
```bash
npm run db:migrate
```

#### روش دوم: استفاده از SQL Editor در Supabase Dashboard
1. به Supabase Dashboard بروید
2. به بخش SQL Editor بروید
3. اسکریپت migration را از پوشه `prisma/migrations` کپی و اجرا کنید

### ۵. Seed کردن دیتابیس (اختیاری)
برای اضافه کردن داده‌های اولیه:

```bash
npm run db:seed
```

### ۶. استقرار در Vercel

#### الف: اتصال به GitHub
1. پروژه را به GitHub Push کنید
2. در Vercel، پروژه را از GitHub ایمپورت کنید

#### ب: تنظیم Environment Variables در Vercel
در Vercel Dashboard:
1. به Settings > Environment Variables بروید
2. متغیرهای زیر را اضافه کنید:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`

#### ج: Deploy
پروژه به صورت خودکار Deploy می‌شود. اگر خطایی داشت، لاگ‌ها را بررسی کنید.

---

## ساختار جداول Supabase

پروژه Noban از جداول زیر استفاده می‌کند:

- `User` - کاربران (بیماران)
- `Doctor` - پزشکان
- `Specialty` - تخصص‌ها
- `Appointment` - نوبت‌ها
- `Review` - نظرات
- `Favorite` - علاقه‌مندی‌ها
- `Notification` - اعلان‌ها
- `LoginEvent` - تاریخچه ورود
- `OtpCode` - کدهای OTP
- `Availability` - زمان‌بندی پزشکان

---

## نکات مهم

### امنیت
- هرگز `SUPABASE_SERVICE_ROLE_KEY` را در کلاینت استفاده نکنید
- فقط از `NEXT_PUBLIC_SUPABASE_ANON_KEY` در کدهای کلاینت استفاده کنید
- Row Level Security (RLS) را در Supabase فعال کنید

### بهینه‌سازی
- ایندکس‌های ضروری در Schema تعریف شده‌اند
- از Connection Pooling در محیط Production استفاده شود

### پشتیبان‌گیری
- Supabase به صورت خودکار Backup روزانه می‌گیرد
- می‌توانید از بخش Database > Backups مدیریت کنید

---

## رفع مشکل

### خطای Connection
اگر خطای اتصال به دیتابیس داشتید:
1. بررسی کنید `DATABASE_URL` صحیح است
2. مطمئن شوید IP Vercel در Supabase whitelist شده باشد
   - به Database > Settings > Connection pooling بروید
   - گزینه "Use connection pooler" را فعال کنید

### خطای Prisma
اگر Prisma Client آپدیت نیست:
```bash
npm run db:generate
```

---

## منابع بیشتر

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [Next.js on Vercel](https://vercel.com/docs/deployments/nextjs)
