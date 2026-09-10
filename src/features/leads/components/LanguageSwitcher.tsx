import Link from "next/link";
import { getLandingCopy } from "@/features/leads/copy";
import type { Locale } from "@/i18n/locales";

type LanguageSwitcherProps = {
  locale: Locale;
};

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const alternativeLocale = locale === "en" ? "es" : "en";
  const copy = getLandingCopy(locale);

  return (
    <Link
      className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent"
      href={`/${alternativeLocale}`}
      lang={alternativeLocale}
    >
      {copy.languageSwitch}
    </Link>
  );
}
