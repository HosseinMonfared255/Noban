import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validatePhone, normalizePhone, validateOtp } from "@/lib/auth";

/**
 * POST /api/auth/login/verify
 * مرحله دوم ورود: تأیید کد OTP و ورود به سیستم
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp } = body;

    if (!phone || !validatePhone(phone)) {
      return NextResponse.json(
        { success: false, error: "شماره موبایل نامعتبر است" },
        { status: 400 }
      );
    }

    if (!otp || !validateOtp(otp)) {
      return NextResponse.json(
        { success: false, error: "کد باید ۶ رقم باشد" },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phone);

    const user = await db.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "کاربر یافت نشد" },
        { status: 404 }
      );
    }

    // تأیید اتمیک OTP
    const result = await db.otpCode.updateMany({
      where: {
        userId: user.id,
        code: otp,
        purpose: "login",
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      data: { isUsed: true },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: "کد نامعتبر یا منقضی است" },
        { status: 400 }
      );
    }

    // ثبت رویداد ورود
    await db.loginEvent.create({
      data: {
        userId: user.id,
        method: "otp",
        device: "unknown",
      },
    });

    return NextResponse.json({
      success: true,
      message: "ورود موفقیت‌آمیز بود",
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login verify error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور" },
      { status: 500 }
    );
  }
}
