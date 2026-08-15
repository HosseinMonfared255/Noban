/**
 * توابع کمکی احراز هویت
 */

/**
 * هش کردن رمز عبور با SHA-256 + salt تصادفی
 * نکته: در محیط تولید با bcrypt جایگزین شود
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  // تولید salt تصادفی برای هر کاربر
  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  const salt = Array.from(saltBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const data = encoder.encode(password + salt);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const hashHex = Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${salt}:${hashHex}`;
}

/**
 * بررسی رمز عبور با مقایسه زمان‌امن
 */
export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const computed = await crypto.subtle.digest("SHA-256", data);
  const computedHex = Array.from(new Uint8Array(computed))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  // مقایسه زمان‌امن (constant-time comparison)
  if (computedHex.length !== hash.length) return false;
  let diff = 0;
  for (let i = 0; i < computedHex.length; i++) {
    diff |= computedHex.charCodeAt(i) ^ hash.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * تولید کد OTP ۶ رقمی با crypto امن (Web Crypto API)
 */
export function generateOtpCode(): string {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return (100000 + (arr[0] % 900000)).toString();
}

/**
 * تولید کد رهگیری ۵ رقمی با crypto امن
 */
export function generateTrackingCode(): string {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return (10000 + (arr[0] % 90000)).toString();
}

/**
 * اعتبارسنجی شماره موبایل ایرانی
 */
export function validatePhone(phone: string): boolean {
  const clean = phone.replace(/[\s\-()]/g, "");
  return /^(\+98|98|0)?9\d{9}$/.test(clean);
}

/**
 * نرمال‌سازی شماره موبایل به فرمت 09123456789
 */
export function normalizePhone(phone: string): string {
  const clean = phone.replace(/[\s\-()]/g, "");
  if (clean.startsWith("+98")) return "0" + clean.slice(3);
  if (clean.startsWith("98")) return "0" + clean.slice(2);
  if (!clean.startsWith("0")) return "0" + clean;
  return clean;
}

/**
 * اعتبارسنجی کد OTP (۶ رقم)
 */
export function validateOtp(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

/**
 * بررسی محیط توسعه
 */
export function isDev(): boolean {
  return process.env.NODE_ENV !== "production";
}
