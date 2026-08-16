"use client";

import { useEffect, useRef, useState } from "react";
import CustomCursor from "./components/CustomCursor";
import ScrollProgress from "./components/ScrollProgress";
import Navbar from "./components/Navbar";
import PanelHeader from "./components/PanelHeader";
import Hero from "./components/Hero";
import Specialties from "./components/Specialties";
import Doctors from "./components/Doctors";
import BookingFlow from "./components/BookingFlow";
import Stats from "./components/Stats";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import DoctorsPage from "./pages/DoctorsPage";
import DoctorProfile from "./pages/DoctorProfile";
import AuthPage from "./pages/AuthPage";
import DoctorPanel from "./pages/DoctorPanel";
import AdminPanel from "./pages/AdminPanel";
import SecretaryPanel from "./pages/SecretaryPanel";
import FavoritesPage from "./pages/FavoritesPage";
import ArticlePage from "./pages/ArticlePage";
import AppointmentsPage from "./pages/AppointmentsPage";
import ProfilePage from "./pages/ProfilePage";
import HelpPage from "./pages/HelpPage";
import BackToTop from "./components/BackToTop";
import HealthTips from "./components/HealthTips";
import Faq from "./components/Faq";
import CompareBar from "./components/CompareBar";
import CompareModal from "./components/CompareModal";
import MobileBottomNav from "./components/MobileBottomNav";
import type { Nav, PageName } from "./nav";

export default function App() {
  const [page, setPage] = useState<PageName>("home");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedArticle, setSelectedArticle] = useState<string>("1");
  const [compareOpen, setCompareOpen] = useState(false);
  const pendingScroll = useRef<string | null>(null);

  const navigate: Nav = (target, section, doctorName) => {
    if (target === "doctor") {
      setSelectedDoctor(doctorName ?? "");
      setPage("doctor");
      window.scrollTo(0, 0);
      return;
    }
    if (target === "doctors") {
      setPage("doctors");
      window.scrollTo(0, 0);
      return;
    }
    if (target === "login") {
      setPage("login");
      window.scrollTo(0, 0);
      return;
    }
    if (target === "panel") {
      setPage("panel");
      window.scrollTo(0, 0);
      return;
    }
    if (target === "admin") {
      setPage("admin");
      window.scrollTo(0, 0);
      return;
    }
    if (target === "secretary") {
      setPage("secretary");
      window.scrollTo(0, 0);
      return;
    }
    if (target === "favorites") {
      setPage("favorites");
      window.scrollTo(0, 0);
      return;
    }
    if (target === "article") {
      setSelectedArticle(doctorName ?? "1");
      setPage("article");
      window.scrollTo(0, 0);
      return;
    }
    if (target === "appointments") {
      setPage("appointments");
      window.scrollTo(0, 0);
      return;
    }
    if (target === "profile") {
      setPage("profile");
      window.scrollTo(0, 0);
      return;
    }
    if (target === "help") {
      setPage("help");
      window.scrollTo(0, 0);
      return;
    }
    // target === "home"
    if (page !== "home") {
      pendingScroll.current = section ?? null;
      setPage("home");
    } else if (section) {
      document.querySelector(section)?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (page === "home" && pendingScroll.current) {
      const id = pendingScroll.current;
      pendingScroll.current = null;
      const t = setTimeout(
        () => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" }),
        80
      );
      return () => clearTimeout(t);
    }
    if (page === "home") {
      window.scrollTo(0, 0);
    }
  }, [page]);

  const activeDoctor = null; // Will be fetched dynamically in DoctorProfile page
  
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* ambient page background — light: pastel blobs / dark: subtle deep tones */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 right-0 h-[28rem] w-[28rem] rounded-full bg-cyan-300/20 blur-[80px] dark:bg-cyan-500/10" />
        <div className="absolute top-1/3 -left-40 h-[26rem] w-[26rem] rounded-full bg-blue-300/20 blur-[80px] dark:bg-blue-500/10" />
        <div className="absolute bottom-0 right-1/4 h-[24rem] w-[24rem] rounded-full bg-violet-300/15 blur-[80px] dark:bg-violet-500/5" />
      </div>

      <CustomCursor />
      <ScrollProgress />
      {page === "login"
        ? null
        : page === "panel" || page === "secretary" || page === "admin"
        ? <PanelHeader page={page} navigate={navigate} />
        : <Navbar navigate={navigate} page={page} />}

      {page === "home" ? (
        <>
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
        </>
      ) : page === "doctors" ? (
        <main>
          <DoctorsPage navigate={navigate} />
        </main>
      ) : page === "login" ? (
        <AuthPage navigate={navigate} />
      ) : page === "panel" ? (
        <DoctorPanel navigate={navigate} />
      ) : page === "admin" ? (
        <AdminPanel navigate={navigate} />
      ) : page === "secretary" ? (
        <SecretaryPanel navigate={navigate} />
      ) : page === "favorites" ? (
        <main>
          <FavoritesPage navigate={navigate} />
        </main>
      ) : page === "article" ? (
        <main>
          <ArticlePage articleId={selectedArticle} navigate={navigate} />
        </main>
      ) : page === "appointments" ? (
        <main>
          <AppointmentsPage navigate={navigate} />
        </main>
      ) : page === "profile" ? (
        <main>
          <ProfilePage navigate={navigate} />
        </main>
      ) : page === "help" ? (
        <main>
          <HelpPage navigate={navigate} />
        </main>
      ) : (
        <main>
          <DoctorProfile doctor={activeDoctor} navigate={navigate} />
        </main>
      )}

      <BackToTop />

      <CompareBar onOpen={() => setCompareOpen(true)} />
      <CompareModal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        navigate={navigate}
      />

      <MobileBottomNav page={page} navigate={navigate} />
    </div>
  );
}
