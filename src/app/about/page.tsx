import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "درباره نوبان | سامانه هوشمند رزرو نوبت پزشک",
  description:
    "نوبان پلتفرم هوشمند رزرو نوبت پزشک است که با هدف تسهیل دسترسی بیماران به متخصصان طراحی شده است.",
};

/**
 * /about — صفحه درباره ما
 *
 * این صفحه به‌صورت Server Component است (بدون "use client")
 * زیرا محتوای استاتیکی دارد و نیازی به تعامل کاربر ندارد.
 * این یکی از ویژگی‌های بومی App Router است.
 */
export default function AboutPage() {
  return (
    <div className="min-h-screen pb-10 pt-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* عنوان */}
        <div className="text-center">
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30">
            <svg viewBox="0 0 24 24" className="h-10 w-10">
              <path
                fill="currentColor"
                d="M10.5 2h3a1 1 0 0 1 1 1V8h5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-5v8a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-8h-5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h5V3a1 1 0 0 1 1-1z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
            درباره نوبان
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            سامانه هوشمند رزرو نوبت پزشک، ساخته‌شده برای شهرستان درگز
          </p>
        </div>

        {/* محتوای اصلی */}
        <div className="mt-12 space-y-8">
          {/* مأموریت */}
          <section className="rounded-3xl glass p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-black text-slate-900 dark:text-slate-100">
              مأموریت ما
            </h2>
            <p className="leading-relaxed text-slate-600 dark:text-slate-300">
              نوبان با هدف تسهیل دسترسی بیماران به پزشکان متخصص طراحی شده است.
              ما معتقدیم هیچ‌کس نباید برای دریافت نوبت پزشکی ساعت‌ها در صف تلفن
              منتظر بماند. با نوبان، شما می‌توانید در کمتر از یک دقیقه، نوبت
              بهترین متخصصان شهر را به‌صورت آنلاین رزرو کنید.
            </p>
          </section>

          {/* ویژگی‌ها */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "📅",
                title: "رزرو آنلاین فوری",
                desc: "بدون معطلی در صف تلفن، در کمتر از یک دقیقه نوبت بگیرید.",
              },
              {
                icon: "🔔",
                title: "یادآور هوشمند",
                desc: "پیامک و اعلان پیش از ویزیت تا هیچ نوبتی را فراموش نکنید.",
              },
              {
                icon: "🔐",
                title: "حریم خصوصی امن",
                desc: "اطلاعات پزشکی شما با رمزنگاری سطح بانکی محافظت می‌شود.",
              },
              {
                icon: "📋",
                title: "پرونده دیجیتال",
                desc: "تاریخچه ویزیت‌ها، نسخه‌ها و آزمایش‌ها همیشه همراه شما.",
              },
              {
                icon: "⏰",
                title: "نوبت‌دهی یکپارچه",
                desc: "تقویم زنده ده‌ها مطب و تخصص در یک پلتفرم.",
              },
              {
                icon: "💳",
                title: "پرداخت امن",
                desc: "پرداخت آنلاین از طریق درگاه امن بانکی.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl glass p-5 transition hover:shadow-lg hover:shadow-cyan-500/10"
              >
                <div className="mb-3 text-3xl">{item.icon}</div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </section>

          {/* آمار */}
          <section className="grid grid-cols-2 gap-4 rounded-3xl glass p-6 sm:grid-cols-4 sm:p-8">
            {[
              { value: "۲۵۰+", label: "پزشک متخصص" },
              { value: "۴۰هزار", label: "بیمار راضی" },
              { value: "۱۸", label: "تخصص پزشکی" },
              { value: "۹۹٪", label: "رضایت کاربران" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="bg-gradient-to-b from-cyan-600 to-blue-700 bg-clip-text text-3xl font-black text-transparent sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </section>

          {/* دعوت به اقدام */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-cyan-500 to-blue-600 p-8 text-center text-white sm:p-12">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl font-black sm:text-3xl">
                آماده‌اید سلامت خود را جدی بگیرید؟
              </h2>
              <p className="mt-2 text-cyan-50">
                همین امروز به هزاران بیمار بپیوندید که با نوبان زمان و سلامت
                خود را مدیریت می‌کنند.
              </p>
              <a
                href="/"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-cyan-700 shadow-lg transition hover:scale-105"
              >
                شروع رزرو نوبت
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
