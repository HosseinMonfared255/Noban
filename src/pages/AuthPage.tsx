"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Icon from "../components/Icon";
import OtpInput from "../components/OtpInput";
import { useAuth, type User } from "../store/auth";
import type { Nav } from "../nav";

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const toFa = (s: string | number) =>
  String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

/* State machine:
 *
 * LOGIN (password):
 *   "login" → enter phone+password → "login-loading" → "success"
 *
 * LOGIN with OTP:
 *   "login" → click "ورود با کد" → "otp-phone" → enter phone → "otp-code" → enter code → "otp-loading" → "success"
 *
 * SIGNUP (multi-step):
 *   "login" → click "ثبت‌نام کنید" → "signup-phone" → enter phone → "signup-code" → enter code → "signup-name" → enter name → "signup-loading" → "success"
 */
type Step =
  | "login"
  | "otp-phone"
  | "otp-code"
  | "signup-phone"
  | "signup-code"
  | "signup-name"
  | "loading"
  | "success";

export default function AuthPage({ navigate }: { navigate: Nav }) {
  const [step, setStep] = useState<Step>("login");
  const [loading, setLoading] = useState(false);

  // fields
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [showPw, setShowPw] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start countdown timer for OTP resend
  const startTimer = () => {
    setTimer(120);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  // Form validation helpers
  const phoneValid = phone.replace(/\D/g, "").length >= 10;
  const otpComplete = otp.every((d) => d !== "");
  const nameValid = !!(firstName.trim() && lastName.trim());

  // --- Submit handlers ---
  const loginUser = useAuth((s) => s.login);
  const submitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneValid || !password) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Mock: login with phone + a default name derived from phone
      loginUser({
        id: genId(),
        phone,
        firstName: "کاربر",
        lastName: "نوبان",
        createdAt: new Date().toISOString(),
        loginHistory: [],
      });
      setStep("success");
    }, 1400);
  };

  const goOtpCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneValid) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error);
        return;
      }
      if (data.devOtp) {
        toast.success(`کد ورود (آزمایشی): ${toFa(data.devOtp)}`, {
          duration: 10000,
          icon: "🔐",
        });
      }
      setStep("otp-code");
      startTimer();
    } catch {
      toast.error("خطای شبکه. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  const goSignupCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneValid) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error);
        return;
      }
      // در حالت آزمایشی: کد OTP را نمایش بده
      if (data.devOtp) {
        toast.success(`کد تأیید (آزمایشی): ${toFa(data.devOtp)}`, {
          duration: 10000,
          icon: "🔐",
        });
      }
      setStep("signup-code");
      startTimer();
    } catch {
      toast.error("خطای شبکه. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  const submitOtpLogin = async () => {
    if (!otpComplete) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: otp.join("") }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error);
        return;
      }
      loginUser({
        id: data.user.id,
        phone: data.user.phone,
        firstName: data.user.firstName || "کاربر",
        lastName: data.user.lastName || "نوبان",
        createdAt: data.user.createdAt,
        loginHistory: [],
      });
      setStep("success");
    } catch {
      toast.error("خطای شبکه. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  const goSignupName = async () => {
    if (!otpComplete) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          otp: otp.join(""),
          firstName: "",
          lastName: "",
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error);
        return;
      }
      setStep("signup-name");
    } catch {
      toast.error("خطای شبکه. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  const submitSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameValid) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error);
        return;
      }
      // ثبت‌نام موفق — ورود کاربر به سیستم
      loginUser({
        id: data.user.id,
        phone: data.user.phone,
        firstName: data.user.firstName || firstName.trim(),
        lastName: data.user.lastName || lastName.trim(),
        createdAt: data.user.createdAt,
        loginHistory: [],
      });
      setStep("success");
    } catch {
      toast.error("خطای شبکه. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  const fmtTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${toFa(String(m).padStart(2, "0"))}:${toFa(String(sec).padStart(2, "0"))}`;
  };

  // Step labels for progress indicator (signup flow)
  const signupSteps = ["شماره", "کد", "نام"];
  const currentSignupStep =
    step === "signup-phone" ? 0 : step === "signup-code" ? 1 : step === "signup-name" ? 2 : -1;

  return (
    <section className="relative flex min-h-screen">
      {/* ============ FORM PANEL (right in RTL) ============ */}
      <div className="relative flex w-full flex-col justify-center px-6 py-28 sm:px-10 lg:w-[460px] lg:shrink-0">
        <button
          onClick={() => navigate("home")}
          data-cursor="hover"
          className="mb-6 inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3.5 py-1.5 text-sm font-medium text-slate-600 backdrop-blur transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-800/70"
        >
          <Icon name="arrow" className="h-4 w-4 rotate-180" />
          بازگشت
        </button>

        <AnimatePresence mode="wait">
          {step === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -25 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
                className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-xl shadow-emerald-500/40"
              >
                <Icon name="check" className="h-10 w-10 text-white" />
              </motion.div>
              <h2 className="mt-5 text-2xl font-black text-slate-900 dark:text-slate-100">
                {currentSignupStep >= 0 ? "ثبت‌نام موفقیت‌آمیز بود!" : "ورود موفقیت‌آمیز بود!"}
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {firstName
                  ? `خوش آمدید، ${firstName}. به نوبان پیوستید.`
                  : "خوش آمدید. به نوبان پیوستید."}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                در حال هدایت به صفحه اصلی...
              </p>
              {/* Auto-redirect after 2.5s */}
              <AutoRedirect navigate={navigate} />
            </motion.div>
          ) : loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center"
            >
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
              <p className="mt-5 font-bold text-slate-700 dark:text-slate-200">
                لطفاً صبر کنید…
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* brand */}
              <div className="mb-6 flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/40">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-white">
                    <path
                      fill="currentColor"
                      d="M10.5 2h3a1 1 0 0 1 1 1V8h5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-5v8a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-8h-5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h5V3a1 1 0 0 1 1-1z"
                    />
                  </svg>
                </div>
                <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  نوبان
                </span>
              </div>

              {/* ---- STEP: LOGIN (password) ---- */}
              {step === "login" && (
                <>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">
                    ورود به حساب
                  </h1>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    برای مدیریت نوبت‌ها و پرونده پزشکی وارد شوید.
                  </p>

                  <form onSubmit={submitLogin} className="mt-6 space-y-3.5">
                    <Labeled label="شماره موبایل">
                      <div className="relative">
                        <Icon
                          name="phone"
                          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-600"
                        />
                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          inputMode="tel"
                          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                          className="input pr-10"
                          data-cursor="text"
                        />
                      </div>
                    </Labeled>

                    <Labeled label="رمز عبور">
                      <div className="relative">
                        <Icon
                          name="shield"
                          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-600"
                        />
                        <input
                          type={showPw ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="input px-10"
                          data-cursor="text"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((s) => !s)}
                          data-cursor="hover"
                          className="absolute left-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:text-cyan-600"
                          aria-label="نمایش رمز"
                        >
                          <Icon name={showPw ? "eyeOff" : "eye"} className="h-4 w-4" />
                        </button>
                      </div>
                    </Labeled>

                    <div className="flex items-center justify-between text-xs">
                      <label className="flex cursor-pointer items-center gap-2 text-slate-500">
                        <input type="checkbox" className="h-4 w-4 accent-cyan-600" />
                        مرا به خاطر بسپار
                      </label>
                      <button
                        type="button"
                        data-cursor="hover"
                        className="font-semibold text-cyan-700 hover:underline"
                        onClick={() => toast.info("بازگردانی رمز عبور فعلاً فعال نیست")}
                      >
                        فراموشی رمز؟
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={!phoneValid || !password}
                      data-cursor={phoneValid && password ? "hover" : undefined}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition ${
                        phoneValid && password
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/30 hover:scale-[1.01]"
                          : "cursor-not-allowed bg-slate-300 dark:bg-slate-600"
                      }`}
                    >
                      <Icon name="arrow" className="h-4 w-4" />
                      ورود
                    </button>
                  </form>

                  {/* divider */}
                  <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
                    <span className="h-px flex-1 bg-slate-200" />
                    یا
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>

                  {/* OTP login option */}
                  <button
                    onClick={() => setStep("otp-phone")}
                    data-cursor="hover"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-600 dark:bg-slate-800"
                  >
                    <Icon name="phone" className="h-4 w-4 text-cyan-600" />
                    ورود با کد یکبار مصرف
                  </button>

                  {/* Signup link */}
                  <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    حساب ندارید؟{" "}
                    <button
                      onClick={() => {
                        setStep("signup-phone");
                        setPhone("");
                        setOtp(["", "", "", "", "", ""]);
                      }}
                      data-cursor="hover"
                      className="font-bold text-cyan-700 hover:underline"
                    >
                      ثبت‌نام کنید
                    </button>
                  </p>
                </>
              )}

              {/* ---- STEP: OTP LOGIN - PHONE ---- */}
              {step === "otp-phone" && (
                <>
                  <BackButton onClick={() => setStep("login")} />
                  <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    ورود با کد یکبار مصرف
                  </h1>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    شماره موبایل خود را وارد کنید تا کد برایتان ارسال شود.
                  </p>

                  <form onSubmit={goOtpCode} className="mt-6 space-y-4">
                    <Labeled label="شماره موبایل">
                      <div className="relative">
                        <Icon
                          name="phone"
                          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-600"
                        />
                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          inputMode="tel"
                          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                          className="input pr-10"
                          data-cursor="text"
                          autoFocus
                        />
                      </div>
                    </Labeled>

                    <button
                      type="submit"
                      disabled={!phoneValid}
                      data-cursor={phoneValid ? "hover" : undefined}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition ${
                        phoneValid
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/30 hover:scale-[1.01]"
                          : "cursor-not-allowed bg-slate-300 dark:bg-slate-600"
                      }`}
                    >
                      ارسال کد
                      <Icon name="arrow" className="h-4 w-4" />
                    </button>
                  </form>

                  <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    رمز عبور دارید؟{" "}
                    <button
                      onClick={() => setStep("login")}
                      data-cursor="hover"
                      className="font-bold text-cyan-700 hover:underline"
                    >
                      ورود با رمز
                    </button>
                  </p>
                </>
              )}

              {/* ---- STEP: OTP LOGIN - CODE ---- */}
              {step === "otp-code" && (
                <>
                  <BackButton onClick={() => setStep("otp-phone")} />
                  <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    وارد کردن کد
                  </h1>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    کد ۶ رقمی به شماره {toFa(phone)} ارسال شد.
                  </p>

                  <div className="mt-8">
                    <OtpInput
                      value={otp}
                      onChange={setOtp}
                      onComplete={submitOtpLogin}
                    />
                  </div>

                  {/* Resend timer */}
                  <div className="mt-6 text-center text-sm">
                    {timer > 0 ? (
                      <span className="text-slate-400">
                        ارسال مجدد کد تا {fmtTimer(timer)}
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          startTimer();
                          setOtp(["", "", "", "", "", ""]);
                        }}
                        data-cursor="hover"
                        className="font-bold text-cyan-700 hover:underline"
                      >
                        ارسال مجدد کد
                      </button>
                    )}
                  </div>

                  <button
                    onClick={submitOtpLogin}
                    disabled={!otpComplete}
                    data-cursor={otpComplete ? "hover" : undefined}
                    className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition ${
                      otpComplete
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/30 hover:scale-[1.01]"
                        : "cursor-not-allowed bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    <Icon name="check" className="h-4 w-4" />
                    تأیید و ورود
                  </button>
                </>
              )}

              {/* ---- STEP: SIGNUP - PHONE ---- */}
              {step === "signup-phone" && (
                <>
                  <BackButton onClick={() => setStep("login")} />
                  <SignupProgress steps={signupSteps} current={currentSignupStep} />
                  <h1 className="mt-4 text-2xl font-black text-slate-900 dark:text-slate-100">
                    ثبت‌نام در نوبان
                  </h1>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    شماره موبایل خود را وارد کنید تا کد تأیید برایتان ارسال شود.
                  </p>

                  <form onSubmit={goSignupCode} className="mt-6 space-y-4">
                    <Labeled label="شماره موبایل">
                      <div className="relative">
                        <Icon
                          name="phone"
                          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-600"
                        />
                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          inputMode="tel"
                          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                          className="input pr-10"
                          data-cursor="text"
                          autoFocus
                        />
                      </div>
                    </Labeled>

                    <button
                      type="submit"
                      disabled={!phoneValid}
                      data-cursor={phoneValid ? "hover" : undefined}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition ${
                        phoneValid
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/30 hover:scale-[1.01]"
                          : "cursor-not-allowed bg-slate-300 dark:bg-slate-600"
                      }`}
                    >
                      ارسال کد تأیید
                      <Icon name="arrow" className="h-4 w-4" />
                    </button>
                  </form>

                  <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    حساب دارید؟{" "}
                    <button
                      onClick={() => setStep("login")}
                      data-cursor="hover"
                      className="font-bold text-cyan-700 hover:underline"
                    >
                      وارد شوید
                    </button>
                  </p>
                </>
              )}

              {/* ---- STEP: SIGNUP - CODE ---- */}
              {step === "signup-code" && (
                <>
                  <BackButton onClick={() => setStep("signup-phone")} />
                  <SignupProgress steps={signupSteps} current={currentSignupStep} />
                  <h1 className="mt-4 text-2xl font-black text-slate-900 dark:text-slate-100">
                    تأیید شماره موبایل
                  </h1>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    کد ۶ رقمی به شماره {toFa(phone)} ارسال شد.
                  </p>

                  <div className="mt-8">
                    <OtpInput
                      value={otp}
                      onChange={setOtp}
                      onComplete={goSignupName}
                    />
                  </div>

                  <div className="mt-6 text-center text-sm">
                    {timer > 0 ? (
                      <span className="text-slate-400">
                        ارسال مجدد کد تا {fmtTimer(timer)}
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          startTimer();
                          setOtp(["", "", "", "", "", ""]);
                        }}
                        data-cursor="hover"
                        className="font-bold text-cyan-700 hover:underline"
                      >
                        ارسال مجدد کد
                      </button>
                    )}
                  </div>

                  <button
                    onClick={goSignupName}
                    disabled={!otpComplete}
                    data-cursor={otpComplete ? "hover" : undefined}
                    className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition ${
                      otpComplete
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/30 hover:scale-[1.01]"
                        : "cursor-not-allowed bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    ادامه
                    <Icon name="arrow" className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* ---- STEP: SIGNUP - NAME ---- */}
              {step === "signup-name" && (
                <>
                  <BackButton onClick={() => setStep("signup-code")} />
                  <SignupProgress steps={signupSteps} current={currentSignupStep} />
                  <h1 className="mt-4 text-2xl font-black text-slate-900 dark:text-slate-100">
                    تکمیل اطلاعات
                  </h1>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    نام و نام خانوادگی خود را وارد کنید.
                  </p>

                  <form onSubmit={submitSignup} className="mt-6 space-y-3.5">
                    <Labeled label="نام">
                      <div className="relative">
                        <Icon
                          name="user"
                          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-600"
                        />
                        <input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="مثلاً نگار"
                          className="input pr-10"
                          data-cursor="text"
                          autoFocus
                        />
                      </div>
                    </Labeled>

                    <Labeled label="نام خانوادگی">
                      <div className="relative">
                        <Icon
                          name="user"
                          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-600"
                        />
                        <input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="مثلاً حسینی"
                          className="input pr-10"
                          data-cursor="text"
                        />
                      </div>
                    </Labeled>

                    <button
                      type="submit"
                      disabled={!nameValid}
                      data-cursor={nameValid ? "hover" : undefined}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition ${
                        nameValid
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/30 hover:scale-[1.01]"
                          : "cursor-not-allowed bg-slate-300 dark:bg-slate-600"
                      }`}
                    >
                      <Icon name="check" className="h-4 w-4" />
                      تکمیل ثبت‌نام
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ============ IMAGE PANEL (left in RTL) ============ */}
      <div className="relative hidden overflow-hidden lg:block lg:flex-1">
        <img
          src="/dargaz-entrance.png"
          alt="ورودی شهر درگز"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* gradient overlay for brand consistency */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-700/70 via-blue-700/50 to-cyan-500/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#04101a]/50 to-transparent" />

        {/* Simple welcome text overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl font-black leading-tight text-white"
          >
            به نوبان خوش آمدید
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="mt-2 text-base leading-relaxed text-cyan-50"
          >
            سامانه هوشمند رزرو نوبت پزشک
          </motion.p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Helper components ---------- */

function Labeled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
        {label}
      </span>
      {children}
    </label>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      data-cursor="hover"
      className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-slate-500 transition hover:text-cyan-700"
    >
      <Icon name="arrow" className="h-4 w-4" />
      بازگشت
    </button>
  );
}

function SignupProgress({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold transition ${
              i < current
                ? "bg-gradient-to-br from-emerald-400 to-teal-600 text-white"
                : i === current
                ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow"
                : "bg-slate-100 text-slate-400 dark:bg-slate-700"
            }`}
          >
            {i < current ? <Icon name="check" className="h-3.5 w-3.5" /> : toFa(i + 1)}
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-0.5 w-8 ${i < current ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-600"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function AutoRedirect({ navigate }: { navigate: Nav }) {
  useEffect(() => {
    const t = setTimeout(() => navigate("home"), 2500);
    return () => clearTimeout(t);
  }, [navigate]);
  return null;
}
