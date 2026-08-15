import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateOtpCode, validatePhone, normalizePhone, isDev } from "@/lib/auth";

/**
 * POST /api/auth/login/otp
 * مرحله اول ورود با کد یکبار مصرف
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

    const user = await db.user.findUnique({
      where: { phone: normalizedPhone },
    });

    // جلوگیری از افشای شماره ثبت‌شده — پیام عمومی
    if (!user) {
      return NextResponse.json(
        { success: false, error: "این شماره ثبت‌نام نکرده است. ابتدا ثبت‌نام کنید." },
        { status: 404 }
      );
    }

    const otpCode = generateOtpCode();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    await db.$transaction([
      // فقط کدهای login قبلی را باطل کن (نه signup)
      db.otpCode.updateMany({
        where: {
          userId: user.id,
          isUsed: false,
          purpose: "login",
        },
        data: { isUsed: true },
      }),
      db.otpCode.create({
        data: {
          userId: user.id,
          code: otpCode,
          purpose: "login",
          expiresAt,
        },
      }),
    ]);

    const response: { success: boolean; message: string; devOtp?: string } = {
      success: true,
      message: "کد ورود ارسال شد",
    };

    if (isDev()) {
      response.devOtp = otpCode;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Login OTP error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
