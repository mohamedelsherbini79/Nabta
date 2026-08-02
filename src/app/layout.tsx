import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Cairo, Geist_Mono } from "next/font/google";
import { I18nProvider } from "@/i18n/I18nProvider";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/i18n/locale";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
import "./globals.css";

// Cairo is a bilingual Arabic/Latin typeface — one clean, warm font family for
// both scripts instead of Arabic silently falling back to the OS system font.
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nabta",
  description: "General medical information powered by AI",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nabta",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#16a34a",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;
  const locale = isSupportedLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${cairo.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
