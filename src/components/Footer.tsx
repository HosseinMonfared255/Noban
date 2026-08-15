"use client";

import { navLinks, specialties } from "../data";
import Icon from "./Icon";

export default function Footer() {
  return (
    <footer className="relative mt-12 border-t border-cyan-100 bg-white/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* CTA strip */}
        <div className="relative mb-16 overflow-hidden rounded-[2rem] bg-gradient-to-l from-cyan-100/70 via-blue-100/50 to-transparent p-8 ring-1 ring-inset ring-cyan-200/70 sm:p-12">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-300/30 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h3 className="text-2xl font-black text-slate-900 sm:text-3xl">
                آماده‌اید سلامت خود را جدی بگیرید؟
              </h3>
              <p className="mt-2 max-w-lg text-slate-600">
                همین امروز به هزاران بیمار بپیوندید که با نوبان زمان و سلامت
                خود را مدیریت می‌کنند.
              </p>
            </div>
            <a
              href="#booking"
              data-cursor="hover"
              className="flex shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-4 font-bold text-white shadow-xl shadow-cyan-500/30 transition hover:scale-105"
            >
              <Icon name="calendar" className="h-5 w-5" />
              رزرو نوبت
            </a>
          </div>
        </div>

        {/* link columns */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-white">
                  <path
                    fill="currentColor"
                    d="M10.5 2h3a1 1 0 0 1 1 1V8h5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-5v8a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-8h-5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h5V3a1 1 0 0 1 1-1z"
                  />
                </svg>
              </div>
              <span className="text-lg font-extrabold text-slate-900">نوبان</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              پلتفرم هوشمند رزرو نوبت پزشک؛ سریع، امن و قابل اعتماد برای مدیریت
              سلامت شما و خانواده‌تان.
            </p>
          </div>

          <FooterCol title="دسترسی سریع" links={navLinks.map((n) => n.label)} />
          <FooterCol
            title="تخصص‌ها"
            links={specialties.slice(0, 5).map((s) => s.name)}
          />

          <div>
            <h4 className="font-bold text-slate-900">تماس با ما</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <Icon name="phone" className="h-4 w-4 text-cyan-600" />
                ۰۲۱ - ۹۱۰۰ ۰۰۰۰
              </li>
              <li className="flex items-center gap-2">
                <Icon name="mail" className="h-4 w-4 text-cyan-600" />
                info@nobat-yar.ir
              </li>
              <li className="flex items-center gap-2">
                <Icon name="location" className="h-4 w-4 text-cyan-600" />
                تهران، خیابان ولیعصر
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-cyan-100 pt-8 text-sm text-slate-400 sm:flex-row">
          <p>© ۱۴۰۳ نوبت‌یار — تمامی حقوق محفوظ است.</p>
          <p className="flex items-center gap-2">
            ساخته‌شده با
            <span className="text-rose-500">♥</span>
            برای سلامتی شما
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="font-bold text-slate-900">{title}</h4>
      <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
        {links.map((l) => (
          <li key={l}>
            <a
              href="#booking"
              data-cursor="hover"
              className="transition hover:text-cyan-700"
            >
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
