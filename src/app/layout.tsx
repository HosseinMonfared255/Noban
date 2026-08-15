import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import "./noban.css";
import { Toaster as Sonner } from "sonner";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "نوبان | سامانه هوشمند رزرو نوبت پزشک",
    template: "%s | نوبان",
  },
  description:
    "نوبان — پلتفرم هوشمند رزرو نوبت پزشک؛ رزرو آنلاین و فوری، یادآور هوشمند، پرونده دیجیتال و تقویم زنده‌ی مطب. بدون معطلی در صف تلفن، در کمتر از یک دقیقه نوبت بگیرید.",
  keywords: [
    "نوبان",
    "رزرو نوبت",
    "نوبت پزشک",
    "پزشک متخصص",
    "رزرو آنلاین نوبت",
    "پرونده دیجیتال",
    "نوبت‌یار",
  ],
  authors: [{ name: "نوبان" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    title: "نوبان | سامانه هوشمند رزرو نوبت پزشک",
    description:
      "رزرو آنلاین و فوری نوبت پزشک با یادآور هوشمند و پرونده دیجیتال.",
    siteName: "نوبان",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1520" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazirmatn.variable} antialiased`}
        style={{ fontFamily: "var(--font-vazirmatn), sans-serif" }}
      >
        {children}
        <Sonner
          position="top-center"
          dir="rtl"
          toastOptions={{
            style: {
              fontFamily: "var(--font-vazirmatn), sans-serif",
              direction: "rtl",
            },
          }}
        />
      </body>
    </html>
  );
}
