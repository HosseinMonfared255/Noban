import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateOtpCode, validatePhone, normalizePhone, isDev } from "@/lib/auth";

/**
 * POST /api/auth/signup/otp
 * مرحله اول ثبت‌نام: دریافت شماره موبایل و تولید کد OTP
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone || !validatePhone(phone)) {
      return NextResponse.json(
        { success: false, error: "شماره موبایل نامعتبر است" },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phone);

    // بررسی ثبت‌نام کامل قبلی
    const existingUser = await db.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (existingUser && existingUser.firstName !== "") {
      return NextResponse.json(
        { success: false, error: "این شماره موبایل قبلاً ثبت‌نام کرده است. وارد شوید." },
        { status: 409 }
      );
    }

    const otpCode = generateOtpCode();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    await db.$transaction([
      // باطل کردن کدهای قبلی
      db.otpCode.updateMany({
        where: {
          user: { phone: normalizedPhone },
          isUsed: false,
          purpose: "signup",
        },
        data: { isUsed: true },
      }),
      // ساخت یا استفاده از کاربر موقت
      db.user.upsert({
        where: { phone: normalizedPhone },
        create: { phone: normalizedPhone, firstName: "", lastName: "" },
        update: {},
      }),
      // ذخیره کد جدید (با upsert user، باید آن را جداگانه ایجاد کنیم)
    ]);

    // دریافت کاربر برای ذخیره OTP
    const user = await db.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "خطای سرور" },
        { status: 500 }
      );
    }

    await db.otpCode.create({
      data: {
        userId: user.id,
        code: otpCode,
        purpose: "signup",
        expiresAt,
      },
    });

    const response: { success: boolean; message: string; devOtp?: string } = {
      success: true,
      message: "کد تأیید ارسال شد",
    };

    // فقط در محیط توسعه کد را برمی‌گردانیم
    if (isDev()) {
      response.devOtp = otpCode;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Signup OTP error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور. لطفاً دوباره تلاش کنید." },
      { status: 500 }
    );
  }
}
