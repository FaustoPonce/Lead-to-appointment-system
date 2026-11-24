import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { env } from "@/config/env";
import { getLandingCopy } from "@/features/leads/copy";
import { isLocale, locales } from "@/i18n/locales";
import "../globals.css";
import "react-phone-number-input/style.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams(): Array<{ locale: string }> {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const copy = getLandingCopy(locale);

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
    title: `Fausto Ponce | ${copy.title}`,
    description: copy.description,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        es: "/es",
        "x-default": "/en",
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <html className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} lang={locale}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
