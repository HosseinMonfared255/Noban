"use client";

import { useEffect, useRef, useState } from "react";
import CustomCursor from "@/components/CustomCursor";
import ScrollProgress from "@/components/ScrollProgress";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Specialties from "@/components/Specialties";
import Doctors from "@/components/Doctors";
import BookingFlow from "@/components/BookingFlow";
import Stats from "@/components/Stats";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import HealthTips from "@/components/HealthTips";
import Faq from "@/components/Faq";
import CompareBar from "@/components/CompareBar";
import CompareModal from "@/components/CompareModal";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useNavigate } from "@/hooks/useNavigate";
import { usePathname } from "next/navigation";

/**
 * صفحه اصلی (/) — لندینگ پیج نوبان
 *
 * این صفحه از App Router واقعی استفاده می‌کند و navigate از
 * useNavigate hook (که useRouter را wrap می‌کند) گرفته می‌شود.
 */
export default function HomePage() {
  const navigate = useNavigate();
  const pathname = usePathname();
  const [compareOpen, setCompareOpen] = useState(false);
  const pendingScroll = useRef<string | null>(null);

  // هندل اسکرول به section مشخص شده (مثلاً #booking)
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const id = window.location.hash;
      pendingScroll.current = id;
      const t = setTimeout(
        () => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" }),
        100
      );
      return () => clearTimeout(t);
    }
    if (pathname === "/") {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* پس‌زمینه محیطی */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 right-0 h-[28rem] w-[28rem] rounded-full bg-cyan-300/20 blur-[80px] dark:bg-cyan-500/10" />
        <div className="absolute top-1/3 -left-40 h-[26rem] w-[26rem] rounded-full bg-blue-300/20 blur-[80px] dark:bg-blue-500/10" />
        <div className="absolute bottom-0 right-1/4 h-[24rem] w-[24rem] rounded-full bg-violet-300/15 blur-[80px] dark:bg-violet-500/5" />
      </div>

      <CustomCursor />
      <ScrollProgress />
      <Navbar navigate={navigate} page="home" />

      <main>
        <Hero navigate={navigate} />
        <BookingFlow navigate={navigate} />
        <Specialties />
        <Doctors navigate={navigate} />
        <Stats />
        <Features />
        <Testimonials />
        <HealthTips navigate={navigate} />
        <Faq />
      </main>
      <Footer />

      <BackToTop />

      <CompareBar onOpen={() => setCompareOpen(true)} />
      <CompareModal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        navigate={navigate}
      />

      <MobileBottomNav page="home" navigate={navigate} />
    </div>
  );
}
