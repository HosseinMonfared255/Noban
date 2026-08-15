"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Nav } from "../nav";
import Icon from "../components/Icon";
import AvatarUpload from "../components/AvatarUpload";
import { useAuth } from "../store/auth";
import { useAppointments } from "../store/appointments";
import { useFavorites } from "../store/favorites";
import { useReviews } from "../store/reviews";
import { useSettings, type NotificationPrefs, type ThemePref, type LanguagePref } from "../store/settings";

const toFa = (s: string | number) =>
  String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "هم‌اکنون";
  if (minutes < 60) return `${toFa(minutes)} دقیقه پیش`;
  if (hours < 24) return `${toFa(hours)} ساعت پیش`;
  if (days < 7) return `${toFa(days)} روز پیش`;
  return new Intl.DateTimeFormat("fa-IR", {
    day: "numeric",
    month: "short",
  }).format(new Date(timestamp));
}

export default function ProfilePage({ navigate }: { navigate: Nav }) {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const updateProfile = useAuth((s) => s.updateProfile);

  const appointments = useAppointments((s) => s.items);
  const favIds = useFavorites((s) => s.ids);
  const reviewsByDoctor = useReviews((s) => s.byDoctor);
  const notifications = useSettings((s) => s.notifications);
  const toggleNotification = useSettings((s) => s.toggleNotification);
  const themePref = useSettings((s) => s.themePref);
  const setThemePref = useSettings((s) => s.setThemePref);
  const languagePref = useSettings((s) => s.languagePref);
  const setLanguagePref = useSettings((s) => s.setLanguagePref);

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // If not logged in, show prompt
  if (!user) {
    return (
      <div className="min-h-screen pb-10 pt-28">
        <div className="mx-auto max-w-md px-4">
          <div className="flex flex-col items-center justify-center rounded-3xl glass py-20 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-cyan-50 text-cyan-300 dark:bg-cyan-900/30">
              <Icon name="user" className="h-10 w-10" />
            </div>
            <h3 className="mt-5 text-xl font-black text-slate-800 dark:text-slate-100">
              وارد حساب نشده‌اید
            </h3>
            <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">
              برای مشاهده پروفایل و مدیریت حساب کاربری، ابتدا وارد شوید.
            </p>
            <button
              onClick={() => navigate("login")}
              data-cursor="hover"
              className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:scale-105"
            >
              <Icon name="arrow" className="h-4 w-4" />
              ورود به حساب
            </button>
          </div>
        </div>
      </div>
    );
  }

  const upcomingCount = appointments.filter(
    (a) => a.status === "upcoming"
  ).length;
  const completedCount = appointments.filter(
    (a) => a.status === "completed"
  ).length;
  const reviewCount = Object.values(reviewsByDoctor).reduce(
    (n, arr) => n + arr.length,
    0
  );

  // Build activity timeline from appointments + reviews + favorites
  type Activity = {
    id: string;
    type: "booking" | "review" | "favorite" | "cancel";
    title: string;
    desc: string;
    timestamp: number;
    icon: string;
    color: string;
  };
  const activities = useMemo<Activity[]>(() => {
    const items: Activity[] = [];
    // Appointments
    for (const apt of appointments) {
      if (apt.status === "upcoming") {
        items.push({
          id: apt.id,
          type: "booking",
          title: `نوبت رزرو شد: ${apt.doctorName}`,
          desc: `${apt.dayName} ${apt.date} ساعت ${toFa(apt.slot)}`,
          timestamp: apt.createdAt,
          icon: "calendar",
          color: "bg-cyan-50 text-cyan-600",
        });
      } else if (apt.status === "cancelled") {
        items.push({
          id: apt.id,
          type: "cancel",
          title: `نوبت لغو شد: ${apt.doctorName}`,
          desc: `کد رهگیری: ${toFa(apt.trackingCode)}`,
          timestamp: apt.createdAt,
          icon: "close",
          color: "bg-rose-50 text-rose-500",
        });
      }
    }
    // Reviews
    for (const [doctorName, reviews] of Object.entries(reviewsByDoctor)) {
      for (const review of reviews) {
        items.push({
          id: review.id,
          type: "review",
          title: `نظر ثبت شد: ${doctorName}`,
          desc: `امتیاز ${toFa(review.rating)} ستاره`,
          timestamp: review.createdAt,
          icon: "star",
          color: "bg-amber-50 text-amber-500",
        });
      }
    }
    // Favorites — we don't have timestamps, so use a synthetic recent time
    for (const name of favIds) {
      items.push({
        id: `fav-${name}`,
        type: "favorite",
        title: `پزشک ذخیره شد: ${name}`,
        desc: "به علاقه‌مندی‌ها اضافه شد",
        timestamp: Date.now() - Math.random() * 86400000 * 7, // within last week
        icon: "user",
        color: "bg-rose-50 text-rose-500",
      });
    }
    // Sort by timestamp desc, take top 8
    return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);
  }, [appointments, reviewsByDoctor, favIds]);

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("نام و نام خانوادگی نمی‌توانند خالی باشند");
      return;
    }
    updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() });
    setEditing(false);
    toast.success("پروفایل به‌روزرسانی شد", { icon: "✅" });
  };

  const handleLogout = () => {
    logout();
    toast.success("از حساب خارج شدید", { icon: "👋" });
    navigate("home");
  };

  const handleExportData = () => {
    const data = {
      user,
      appointments,
      favorites: favIds,
      reviews: reviewsByDoctor,
      settings: { notifications, themePref },
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `noban-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("داده‌ها دانلود شد", { icon: "📥" });
  };

  const handleDeleteAccount = () => {
    // Clear all stores
    useAuth.getState().logout();
    useAppointments.getState().clear();
    useFavorites.getState().clear();
    useReviews.getState().clear();
    useSettings.getState().resetNotifications();
    toast.success("حساب شما حذف شد", { icon: "🗑️" });
    navigate("home");
  };

  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = (user.firstName[0] ?? "") + (user.lastName[0] ?? "");

  return (
    <div className="min-h-screen pb-10 pt-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("home")}
          data-cursor="hover"
          className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-slate-600 backdrop-blur transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-800/70"
        >
          <Icon name="arrow" className="h-4 w-4 rotate-180" />
          بازگشت به خانه
        </button>

        {/* Profile header card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl glass p-6 sm:p-8"
        >
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-200/30 blur-3xl" />
          <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {/* Avatar with upload */}
            <AvatarUpload
              currentAvatar={user.avatar}
              initials={initials}
              onConfirm={(dataUrl) => updateProfile({ avatar: dataUrl })}
              onRemove={() => updateProfile({ avatar: undefined })}
            />
            <div className="flex-1 text-center sm:text-right">
              {editing ? (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="نام"
                      className="input"
                      data-cursor="text"
                    />
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="نام خانوادگی"
                      className="input"
                      data-cursor="text"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      data-cursor="hover"
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white"
                    >
                      <Icon name="check" className="h-3.5 w-3.5" />
                      ذخیره
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setFirstName(user.firstName);
                        setLastName(user.lastName);
                      }}
                      data-cursor="hover"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 dark:border-slate-600 dark:bg-slate-800"
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
                    {fullName}
                  </h1>
                  <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 sm:justify-start">
                    <Icon name="phone" className="h-4 w-4 text-cyan-600" />
                    {toFa(user.phone)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    عضو نوبان از{" "}
                    {new Intl.DateTimeFormat("fa-IR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(user.createdAt))}
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <button
                      onClick={() => setEditing(true)}
                      data-cursor="hover"
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-600 dark:bg-slate-800"
                    >
                      <Icon name="edit" className="h-3.5 w-3.5" />
                      ویرایش پروفایل
                    </button>
                    <button
                      onClick={handleLogout}
                      data-cursor="hover"
                      className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-900/20"
                    >
                      <Icon name="logout" className="h-3.5 w-3.5" />
                      خروج از حساب
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            icon="calendar"
            label="نوبت‌های پیش‌رو"
            value={upcomingCount}
            color="from-cyan-500 to-blue-600"
            onClick={() => navigate("appointments")}
          />
          <StatCard
            icon="check"
            label="ویزیت‌های انجام‌شده"
            value={completedCount}
            color="from-emerald-500 to-teal-600"
            onClick={() => navigate("appointments")}
          />
          <StatCard
            icon="star"
            label="پزشکان علاقه‌مندی"
            value={favIds.length}
            color="from-rose-500 to-red-600"
            onClick={() => navigate("favorites")}
          />
          <StatCard
            icon="spark"
            label="نظرات ثبت‌شده"
            value={reviewCount}
            color="from-violet-500 to-purple-600"
            onClick={() => navigate("doctors")}
          />
        </div>

        {/* Quick actions */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <ActionCard
            icon="calendar"
            title="نوبت‌های من"
            desc="مشاهده و مدیریت رزروهای پزشکی"
            onClick={() => navigate("appointments")}
          />
          <ActionCard
            icon="stethoscope"
            title="پزشکان علاقه‌مندی"
            desc="لیست پزشکان ذخیره‌شده"
            onClick={() => navigate("favorites")}
          />
          <ActionCard
            icon="list"
            title="لیست پزشکان"
            desc="جستجو و رزرو نوبت جدید"
            onClick={() => navigate("doctors")}
          />
          <ActionCard
            icon="chart"
            title="مجله سلامت"
            desc="مقالات و نکات سلامتی"
            onClick={() => navigate("home", "#tips")}
          />
          <ActionCard
            icon="phone"
            title="راهنما و پشتیبانی"
            desc="سوالات متداول و تماس با ما"
            onClick={() => navigate("help")}
          />
        </div>

        {/* Account info */}
        <div className="mt-6 rounded-3xl glass p-6">
          <h3 className="mb-4 flex items-center gap-2 font-black text-slate-900 dark:text-slate-100">
            <Icon name="shield" className="h-5 w-5 text-cyan-600" />
            اطلاعات حساب
          </h3>
          <div className="space-y-3 text-sm">
            <InfoRow
              label="شماره موبایل"
              value={toFa(user.phone)}
              icon="phone"
            />
            <InfoRow
              label="نام و نام خانوادگی"
              value={fullName}
              icon="user"
            />
            <InfoRow
              label="تاریخ عضویت"
              value={new Intl.DateTimeFormat("fa-IR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(new Date(user.createdAt))}
              icon="calendar"
            />
          </div>
        </div>

        {/* Notification preferences */}
        <div className="mt-6 rounded-3xl glass p-6">
          <h3 className="mb-4 flex items-center gap-2 font-black text-slate-900 dark:text-slate-100">
            <Icon name="bell" className="h-5 w-5 text-cyan-600" />
            تنظیمات اعلان‌ها
          </h3>
          <div className="space-y-2">
            {(
              [
                {
                  key: "appointmentReminders" as keyof NotificationPrefs,
                  label: "یادآوری نوبت‌ها",
                  desc: "اعلان قبل از زمان ویزیت",
                  icon: "calendar",
                },
                {
                  key: "reviewReplies" as keyof NotificationPrefs,
                  label: "پاسخ به نظرات",
                  desc: "وقتی پزشک به نظر شما پاسخ می‌دهد",
                  icon: "star",
                },
                {
                  key: "healthTips" as keyof NotificationPrefs,
                  label: "نکات سلامتی",
                  desc: "مقالات و توصیه‌های پزشکی",
                  icon: "spark",
                },
                {
                  key: "promotions" as keyof NotificationPrefs,
                  label: "تخفیف‌ها و پیشنهادها",
                  desc: "اطلاع‌رسانی کمپین‌ها",
                  icon: "wallet",
                },
              ]
            ).map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/50 p-3 dark:border-slate-700 dark:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20">
                    <Icon name={item.icon} className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.desc}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    toggleNotification(item.key);
                    toast.success(
                      notifications[item.key]
                        ? "اعلان غیرفعال شد"
                        : "اعلان فعال شد",
                      { icon: notifications[item.key] ? "🔕" : "🔔" }
                    );
                  }}
                  data-cursor="hover"
                  role="switch"
                  aria-checked={notifications[item.key]}
                  aria-label={item.label}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    notifications[item.key]
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                      : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                      notifications[item.key] ? "left-1" : "right-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Activity timeline */}
        <div className="mt-6 rounded-3xl glass p-6">
          <h3 className="mb-4 flex items-center gap-2 font-black text-slate-900 dark:text-slate-100">
            <Icon name="chart" className="h-5 w-5 text-cyan-600" />
            فعالیت‌های اخیر
          </h3>
          {activities.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-300 dark:bg-slate-700">
                <Icon name="chart" className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                هنوز فعالیتی ثبت نشده
              </p>
              <p className="mt-1 text-xs text-slate-400">
                رزرو نوبت، ثبت نظر یا ذخیره پزشک انجام دهید
              </p>
            </div>
          ) : (
            <div className="relative space-y-4">
              {/* vertical line */}
              <div className="absolute right-[18px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700" />
              {activities.map((act, i) => (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative flex items-start gap-3 pr-1"
                >
                  <span
                    className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full ring-4 ring-white dark:ring-slate-800 ${act.color}`}
                  >
                    <Icon name={act.icon} className="h-4 w-4" />
                  </span>
                  <div className="flex-1 pt-1">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {act.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {act.desc}
                    </div>
                    <div className="mt-0.5 text-[10px] text-slate-400">
                      {formatRelativeTime(act.timestamp)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Theme preference */}
        <div className="mt-6 rounded-3xl glass p-6">
          <h3 className="mb-4 flex items-center gap-2 font-black text-slate-900 dark:text-slate-100">
            <Icon name="spark" className="h-5 w-5 text-cyan-600" />
            ظاهر برنامه
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { key: "light" as ThemePref, label: "روشن", icon: "☀️" },
                { key: "dark" as ThemePref, label: "تیره", icon: "🌙" },
                { key: "system" as ThemePref, label: "سیستم", icon: "💻" },
              ]
            ).map((opt) => {
              const active = themePref === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => {
                    setThemePref(opt.key);
                    toast.success(`حالت «${opt.label}» فعال شد`, { icon: opt.icon });
                  }}
                  data-cursor="hover"
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 p-4 transition ${
                    active
                      ? "border-cyan-500 bg-cyan-50/50 dark:bg-cyan-900/20"
                      : "border-slate-200 bg-white/50 hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-800/50"
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span
                    className={`text-xs font-bold ${
                      active
                        ? "text-cyan-700 dark:text-cyan-300"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Language preference */}
        <div className="mt-6 rounded-3xl glass p-6">
          <h3 className="mb-4 flex items-center gap-2 font-black text-slate-900 dark:text-slate-100">
            <Icon name="user" className="h-5 w-5 text-cyan-600" />
            زبان برنامه
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { key: "fa" as LanguagePref, label: "فارسی", icon: "🇮🇷" },
                { key: "en" as LanguagePref, label: "English", icon: "🇬🇧" },
              ]
            ).map((opt) => {
              const active = languagePref === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => {
                    setLanguagePref(opt.key);
                    toast.success(
                      opt.key === "fa"
                        ? "زبان فارسی انتخاب شد"
                        : "English selected",
                      { icon: opt.icon }
                    );
                  }}
                  data-cursor="hover"
                  className={`flex items-center justify-center gap-2 rounded-2xl border-2 p-4 transition ${
                    active
                      ? "border-cyan-500 bg-cyan-50/50 dark:bg-cyan-900/20"
                      : "border-slate-200 bg-white/50 hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-800/50"
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span
                    className={`text-sm font-bold ${
                      active
                        ? "text-cyan-700 dark:text-cyan-300"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
          {languagePref === "en" && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-600 dark:bg-amber-900/20">
              ℹ️ پشتیبانی کامل از زبان انگلیسی به‌زودی اضافه خواهد شد. فعلاً رابط کاربری فارسی باقی می‌ماند.
            </p>
          )}
        </div>

        {/* Login history */}
        <div className="mt-6 rounded-3xl glass p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-black text-slate-900 dark:text-slate-100">
              <Icon name="clock" className="h-5 w-5 text-cyan-600" />
              تاریخچه ورود
            </h3>
            {user.loginHistory && user.loginHistory.length > 0 && (
              <button
                onClick={() => {
                  useAuth.getState().clearLoginHistory();
                  toast.success("تاریخچه ورود پاک شد", { icon: "🗑️" });
                }}
                data-cursor="hover"
                className="text-xs font-bold text-slate-400 transition hover:text-rose-500"
              >
                پاک کردن
              </button>
            )}
          </div>
          {(!user.loginHistory || user.loginHistory.length === 0) ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-300 dark:bg-slate-700">
                <Icon name="clock" className="h-5 w-5" />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                هنوز ورودی ثبت نشده
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {user.loginHistory.map((event, i) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white/50 p-2.5 dark:border-slate-700 dark:bg-slate-800/50"
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                      event.method === "signup"
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
                        : event.method === "otp"
                        ? "bg-violet-50 text-violet-600 dark:bg-violet-900/20"
                        : "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20"
                    }`}
                  >
                    <Icon
                      name={event.method === "signup" ? "user" : event.method === "otp" ? "phone" : "shield"}
                      className="h-4 w-4"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {event.method === "signup"
                        ? "ثبت‌نام"
                        : event.method === "otp"
                        ? "ورود با کد یکبار مصرف"
                        : "ورود با رمز عبور"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {event.device}
                    </div>
                  </div>
                  <div className="shrink-0 text-left">
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      {formatRelativeTime(event.timestamp)}
                    </div>
                    {i === 0 && (
                      <span className="mt-0.5 inline-block rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:bg-emerald-900/20">
                        فعلی
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security */}
        <div className="mt-6 rounded-3xl glass p-6">
          <h3 className="mb-4 flex items-center gap-2 font-black text-slate-900 dark:text-slate-100">
            <Icon name="shield" className="h-5 w-5 text-cyan-600" />
            امنیت حساب
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setPwModalOpen(true)}
              data-cursor="hover"
              className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white/50 p-3 transition hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20">
                  <Icon name="shield" className="h-4 w-4" />
                </span>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    تغییر رمز عبور
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    رمز عبور حساب خود را تغییر دهید
                  </div>
                </div>
              </div>
              <Icon name="arrow" className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Data management */}
        <div className="mt-6 rounded-3xl glass p-6">
          <h3 className="mb-4 flex items-center gap-2 font-black text-slate-900 dark:text-slate-100">
            <Icon name="list" className="h-5 w-5 text-cyan-600" />
            مدیریت داده‌ها
          </h3>
          <div className="space-y-2">
            <button
              onClick={handleExportData}
              data-cursor="hover"
              className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white/50 p-3 transition hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20">
                  <Icon name="download" className="h-4 w-4" />
                </span>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    خروجی گرفتن از داده‌ها
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    دانلود تمام اطلاعات حساب به صورت فایل JSON
                  </div>
                </div>
              </div>
              <Icon name="arrow" className="h-4 w-4 text-slate-400" />
            </button>

            <button
              onClick={() => setDeleteModalOpen(true)}
              data-cursor="hover"
              className="flex w-full items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/50 p-3 transition hover:bg-rose-50 dark:border-rose-800 dark:bg-rose-900/10"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/30">
                  <Icon name="trash" className="h-4 w-4" />
                </span>
                <div className="text-right">
                  <div className="text-sm font-bold text-rose-700 dark:text-rose-300">
                    حذف حساب کاربری
                  </div>
                  <div className="text-[11px] text-rose-400">
                    تمام داده‌های شما برای همیشه حذف خواهد شد
                  </div>
                </div>
              </div>
              <Icon name="arrow" className="h-4 w-4 text-rose-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Password change modal */}
      <AnimatePresence>
        {pwModalOpen && (
          <PasswordModal
            onClose={() => setPwModalOpen(false)}
            onSuccess={() => {
              setPwModalOpen(false);
              toast.success("رمز عبور تغییر کرد", { icon: "🔐" });
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete account modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <DeleteAccountModal
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={() => {
              handleDeleteAccount();
              setDeleteModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Helper components ---------- */

function StatCard({
  icon,
  label,
  value,
  color,
  onClick,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      data-cursor="hover"
      className="group rounded-2xl glass p-4 text-center transition hover:shadow-lg hover:shadow-cyan-500/10"
    >
      <div
        className={`mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${color} text-white shadow-md transition group-hover:scale-110`}
      >
        <Icon name={icon} className="h-5 w-5" />
      </div>
      <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
        {toFa(value)}
      </div>
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {label}
      </div>
    </button>
  );
}

function ActionCard({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: string;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      data-cursor="hover"
      className="group flex items-center gap-3 rounded-2xl glass p-4 text-right transition hover:shadow-lg hover:shadow-cyan-500/10"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white transition group-hover:scale-110">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <div className="font-bold text-slate-900 dark:text-slate-100">
          {title}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {desc}
        </div>
      </div>
      <Icon
        name="arrow"
        className="h-4 w-4 text-slate-400 transition group-hover:-translate-x-1 group-hover:text-cyan-600"
      />
    </button>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-slate-700">
      <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <Icon name={icon} className="h-4 w-4 text-cyan-600" />
        {label}
      </span>
      <span className="font-bold text-slate-800 dark:text-slate-100">
        {value}
      </span>
    </div>
  );
}

/* ---------- Password change modal ---------- */
function PasswordModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!current || !next || !confirm) {
      setErr("لطفاً تمام فیلدها را پر کنید.");
      return;
    }
    if (next.length < 6) {
      setErr("رمز جدید باید حداقل ۶ کاراکتر باشد.");
      return;
    }
    if (next !== confirm) {
      setErr("رمز جدید و تکرار آن یکسان نیستند.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="glass w-full max-w-md overflow-hidden rounded-3xl shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
              <Icon name="shield" className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              تغییر رمز عبور
            </h3>
          </div>
          <button
            onClick={onClose}
            data-cursor="hover"
            className="grid h-8 w-8 place-items-center rounded-lg bg-white/70 text-slate-500 dark:bg-slate-800/70"
            aria-label="بستن"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3 p-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">
              رمز فعلی
            </label>
            <input
              type={show ? "text" : "password"}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="••••••••"
              className="input"
              data-cursor="text"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">
              رمز جدید
            </label>
            <input
              type={show ? "text" : "password"}
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="حداقل ۶ کاراکتر"
              className="input"
              data-cursor="text"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">
              تکرار رمز جدید
            </label>
            <input
              type={show ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="input"
              data-cursor="text"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-500">
            <input
              type="checkbox"
              checked={show}
              onChange={(e) => setShow(e.target.checked)}
              className="h-4 w-4 accent-cyan-600"
            />
            نمایش رمز
          </label>
          {err && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 dark:bg-rose-900/20">
              {err}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            data-cursor="hover"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:scale-[1.01] disabled:opacity-80"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                لطفاً صبر کنید…
              </>
            ) : (
              <>
                <Icon name="check" className="h-4 w-4" />
                تغییر رمز
              </>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ---------- Delete account modal ---------- */
function DeleteAccountModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const canDelete = confirmText.trim() === "حذف";

  const handleDelete = () => {
    if (!canDelete) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onConfirm();
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="glass w-full max-w-md overflow-hidden rounded-3xl shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white">
              <Icon name="trash" className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              حذف حساب کاربری
            </h3>
          </div>
          <button
            onClick={onClose}
            data-cursor="hover"
            className="grid h-8 w-8 place-items-center rounded-lg bg-white/70 text-slate-500 dark:bg-slate-800/70"
            aria-label="بستن"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4">
          <div className="mb-4 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
            <p className="font-bold">⚠️ هشدار</p>
            <p className="mt-1 text-xs">
              این عملیات غیرقابل بازگشت است. تمام نوبت‌ها، نظرات، علاقه‌مندی‌ها و
              تنظیمات شما برای همیشه حذف خواهد شد.
            </p>
          </div>
          <p className="mb-2 text-xs font-bold text-slate-600 dark:text-slate-300">
            برای تأیید، کلمه «حذف» را بنویسید:
          </p>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="حذف"
            className="input"
            data-cursor="text"
          />
          <div className="mt-4 flex gap-2">
            <button
              onClick={onClose}
              data-cursor="hover"
              className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-600 transition hover:border-slate-300 dark:border-slate-600 dark:bg-slate-800"
            >
              انصراف
            </button>
            <button
              onClick={handleDelete}
              disabled={!canDelete || loading}
              data-cursor={canDelete ? "hover" : undefined}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition ${
                canDelete
                  ? "bg-gradient-to-r from-rose-500 to-red-600 shadow-lg shadow-rose-500/30 hover:scale-[1.01]"
                  : "cursor-not-allowed bg-slate-300 dark:bg-slate-600"
              }`}
            >
              {loading ? "در حال حذف…" : "حذف حساب"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
