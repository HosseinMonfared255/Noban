import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validatePhone, normalizePhone } from "@/lib/auth";

/**
 * POST /api/auth/signup/complete
 * مرحله سوم ثبت‌نام: تکمیل نام و نام خانوادگی
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, firstName, lastName } = body;

    if (!phone || !validatePhone(phone)) {
      return NextResponse.json(
        { success: false, error: "شماره موبایل نامعتبر است" },
        { status: 400 }
      );
    }

    if (!firstName || !firstName.trim() || !lastName || !lastName.trim()) {
      return NextResponse.json(
        { success: false, error: "نام و نام خانوادگی الزامی است" },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phone);

    const user = await db.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "کاربر یافت نشد. ابتدا کد تأیید دریافت کنید." },
        { status: 404 }
      );
    }

    if (user.firstName !== "") {
      return NextResponse.json(
        { success: false, error: "این کاربر قبلاً ثبت‌نام کامل کرده است" },
        { status: 409 }
      );
    }

    // بررسی تأیید OTP در ۱۰ دقیقه اخیر
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const verifiedOtp = await db.otpCode.findFirst({
      where: {
        userId: user.id,
        purpose: "signup",
        isUsed: true,
        createdAt: { gt: tenMinutesAgo },
      },
    });

    if (!verifiedOtp) {
      return NextResponse.json(
        { success: false, error: "ابتدا کد تأیید را وارد کنید" },
        { status: 400 }
      );
    }

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
        avatar: updatedUser.avatar,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Signup complete error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور. لطفاً دوباره تلاش کنید." },
      { status: 500 }
    );
  }
}
