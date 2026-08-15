import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validatePhone, normalizePhone, validateOtp } from "@/lib/auth";

/**
 * POST /api/auth/signup/verify
 * مرحله دوم ثبت‌نام: تأیید کد OTP
 * اگر firstName و lastName ارسال شوند، ثبت‌نام کامل می‌شود.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp, firstName, lastName } = body;

    if (!phone || !validatePhone(phone)) {
      return NextResponse.json(
        { success: false, error: "شماره موبایل نامعتبر است" },
        { status: 400 }
      );
    }

    if (!otp || !validateOtp(otp)) {
      return NextResponse.json(
        { success: false, error: "کد تأیید باید ۶ رقم باشد" },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phone);

    const user = await db.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "ابتدا درخواست کد تأیید کنید" },
        { status: 404 }
      );
    }

    // بررسی امن بودن کاربر قبلاً ثبت‌نام کرده
    if (user.firstName !== "") {
      return NextResponse.json(
        { success: false, error: "این کاربر قبلاً ثبت‌نام کرده است" },
        { status: 409 }
      );
    }

    // تأیید اتمیک OTP: updateMany + بررسی count
    const result = await db.otpCode.updateMany({
      where: {
        userId: user.id,
        code: otp,
        purpose: "signup",
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      data: { isUsed: true },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: "کد تأیید نامعتبر یا منقضی است" },
        { status: 400 }
      );
    }

    // اگر نام ارسال شده، ثبت‌نام را تکمیل کن
    if (firstName && firstName.trim() && lastName && lastName.trim()) {
      const [updatedUser] = await db.$transaction([
        db.user.update({
          where: { id: user.id },
          data: {
            firstName: firstName.trim().slice(0, 50),
            lastName: lastName.trim().slice(0, 50),
          },
        }),
        db.loginEvent.create({
          data: {
            userId: user.id,
            method: "signup",
            device: "unknown",
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: "ثبت‌نام با موفقیت انجام شد",
        user: {
          id: updatedUser.id,
          phone: updatedUser.phone,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          createdAt: updatedUser.createdAt,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "کد تأیید شد",
    });
  } catch (error) {
    console.error("Signup verify error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور. لطفاً دوباره تلاش کنید." },
      { status: 500 }
    );
  }
}
